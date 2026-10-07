import { DatabaseSync } from "node:sqlite";
import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Pop, User, Version } from "./types.ts";
export const dataDir = path.resolve(
  /* turbopackIgnore: true */ process.env.POPS_DATA_DIR ||
    path.join(process.cwd(), "data"),
);
let instance: DatabaseSync | undefined;
export function db() {
  if (instance) return instance;
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  instance = new DatabaseSync(path.join(dataDir, "pops.sqlite"));
  instance.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE UNIQUE INDEX IF NOT EXISTS single_administrator ON users(role) WHERE role='admin';
    CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS pops (id TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS versions (id TEXT PRIMARY KEY, pop_id TEXT REFERENCES pops(id) ON DELETE CASCADE, version TEXT NOT NULL, date TEXT NOT NULL, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  if (!instance.prepare("SELECT key FROM metadata WHERE key=?").get("seeded")) {
    instance.exec("BEGIN");
    try {
      if (process.env.POPS_SEED_DEMO !== "false") {
        const examples = [
          ["Higienização das Mãos", "POP-ENF-001", "controle-de-infeccao"],
          ["Administração Segura de Medicamentos", "POP-ENF-002", "enfermagem"],
          ["Punção Venosa Periférica", "POP-ENF-003", "enfermagem"],
          [
            "Atendimento à Parada Cardiorrespiratória",
            "POP-URG-001",
            "urgencia-e-emergencia",
          ],
          [
            "Limpeza e Desinfecção de Superfícies",
            "POP-HIG-001",
            "higienizacao",
          ],
        ];
        for (const [title, code, category] of examples) {
          const p: Pop = {
            id: randomUUID(),
            title,
            code,
            category,
            description:
              "Documento demonstrativo para apresentar a organização do acervo. Substitua pelo POP institucional aprovado.",
            keywords: title,
            version: "1.0",
            createdAt: "2026-10-01",
            updatedAt: "2026-10-01",
            author: "Exemplo demonstrativo",
            approvedBy: "Sem aprovação clínica — demonstração",
            pdfId: null,
            status: "active",
            views: 0,
            isFeatured: false,
            demo: true,
            content: {},
          };
          instance
            .prepare("INSERT INTO pops VALUES (?,?)")
            .run(p.id, JSON.stringify(p));
        }
      }
      instance.prepare("INSERT INTO metadata VALUES (?,?)").run("seeded", "1");
      instance.exec("COMMIT");
    } catch (e) {
      instance.exec("ROLLBACK");
      throw e;
    }
  }
  return instance;
}
export function listPops(includeInactive = false): Pop[] {
  return (db().prepare("SELECT body FROM pops").all() as { body: string }[])
    .map((r) => JSON.parse(r.body) as Pop)
    .filter((p) => includeInactive || p.status === "active");
}
export function getPop(id: string): Pop | undefined {
  const r = db().prepare("SELECT body FROM pops WHERE id=?").get(id) as
    { body: string } | undefined;
  return r ? JSON.parse(r.body) : undefined;
}
export function savePop(pop: Pop) {
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try {
    const old = getPop(pop.id);
    if (
      listPops(true).some(
        (p) =>
          p.code.toLowerCase() === pop.code.toLowerCase() && p.id !== pop.id,
      )
    )
      throw new Error("Já existe um POP com este código.");
    if (old)
      database
        .prepare("INSERT INTO versions VALUES (?,?,?,?,?)")
        .run(
          randomUUID(),
          old.id,
          old.version,
          old.updatedAt,
          JSON.stringify(old),
        );
    database
      .prepare(
        "INSERT INTO pops VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
      )
      .run(pop.id, JSON.stringify(pop));
    database.exec("COMMIT");
  } catch (e) {
    database.exec("ROLLBACK");
    throw e;
  }
}
export function deletePop(id: string) {
  db().prepare("DELETE FROM pops WHERE id=?").run(id);
}
export function incrementViews(id: string) {
  const p = getPop(id);
  if (p) {
    p.views++;
    db()
      .prepare("UPDATE pops SET body=? WHERE id=?")
      .run(JSON.stringify(p), id);
  }
}
export function versions(id: string): Version[] {
  return (
    db()
      .prepare("SELECT * FROM versions WHERE pop_id=? ORDER BY rowid DESC")
      .all(id) as {
      id: string;
      pop_id: string;
      version: string;
      date: string;
      body: string;
    }[]
  ).map((v) => ({
    id: v.id,
    popId: v.pop_id,
    version: v.version,
    date: v.date,
    snapshot: JSON.parse(v.body),
  }));
}
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, hash: string) {
  const [salt, stored] = hash.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(stored, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
// A coluna legada email guarda o identificador: e-mail ou nome de usuário.
export function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "member" = "member",
) {
  const identity = email.trim().toLowerCase();
  if (
    !identity ||
    identity.length > 254 ||
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity) &&
      !/^[a-z0-9][a-z0-9._-]{2,39}$/.test(identity))
  )
    throw new Error("Informe um e-mail ou usuário válido.");
  if (password.length < 12 || password.length > 128)
    throw new Error("A senha deve ter entre 12 e 128 caracteres.");
  if (
    role === "admin" &&
    db().prepare("SELECT id FROM users WHERE role='admin'").get()
  )
    throw new Error("Já existe uma administradora.");
  const id = randomUUID();
  db()
    .prepare("INSERT INTO users VALUES (?,?,?,?,?,1)")
    .run(id, name, email.trim().toLowerCase(), hashPassword(password), role);
  return id;
}
export function listUsers(): User[] {
  return (
    db()
      .prepare("SELECT id,name,email,role,active FROM users ORDER BY role,name")
      .all() as unknown as User[]
  ).map((u) => ({ ...u }));
}
export function toggleMember(id: string) {
  const u = listUsers().find((u) => u.id === id && u.role === "member");
  if (!u) throw new Error("Integrante não encontrado.");
  db()
    .prepare("UPDATE users SET active=? WHERE id=?")
    .run(u.active ? 0 : 1, id);
  db().prepare("DELETE FROM sessions WHERE user_id=?").run(id);
}
export function resetMemberPassword(id: string, password: string) {
  if (!listUsers().some((u) => u.id === id && u.role === "member"))
    throw new Error("Integrante não encontrado.");
  if (password.length < 12 || password.length > 128)
    throw new Error("A senha deve ter entre 12 e 128 caracteres.");
  db()
    .prepare("UPDATE users SET password=? WHERE id=?")
    .run(hashPassword(password), id);
  db().prepare("DELETE FROM sessions WHERE user_id=?").run(id);
}
const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function login(email: string, password: string) {
  const database = db();
  const key = tokenHash(email.trim().toLowerCase());
  const now = Date.now();
  const attempts = database
    .prepare("SELECT count,expires FROM login_attempts WHERE key=?")
    .get(key) as { count: number; expires: number } | undefined;
  if (attempts && attempts.expires > now && attempts.count >= 5)
    throw new Error(
      "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
    );
  const row = database
    .prepare("SELECT * FROM users WHERE email=?")
    .get(email.trim().toLowerCase()) as
    (User & { password: string }) | undefined;
  const valid = verifyPassword(
    password,
    row?.password ?? hashPassword("unused-password-value"),
  );
  if (!row || !row.active || !valid) {
    database
      .prepare(
        "INSERT INTO login_attempts VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET count=excluded.count,expires=excluded.expires",
      )
      .run(
        key,
        attempts && attempts.expires > now ? attempts.count + 1 : 1,
        attempts && attempts.expires > now ? attempts.expires : now + 900000,
      );
    throw new Error("Usuário, e-mail ou senha incorretos.");
  }
  database.prepare("DELETE FROM login_attempts WHERE key=?").run(key);
  database.prepare("DELETE FROM sessions WHERE expires<?").run(now);
  const token = randomBytes(32).toString("hex");
  database
    .prepare("INSERT INTO sessions VALUES (?,?,?)")
    .run(tokenHash(token), row.id, now + 8 * 3600000);
  return token;
}
export function sessionUser(token: string): User | undefined {
  const row = db()
    .prepare(
      "SELECT u.id,u.name,u.email,u.role,u.active FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.hash=? AND s.expires>? AND u.active=1",
    )
    .get(tokenHash(token), Date.now()) as unknown as User | undefined;
  return row ? { ...row } : undefined;
}
export function endSession(token: string) {
  db().prepare("DELETE FROM sessions WHERE hash=?").run(tokenHash(token));
}
