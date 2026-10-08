import { createHash, randomBytes, randomUUID } from "node:crypto";
import * as local from "./local-db.ts";
import { cloudEnabled, rpc } from "./cloud.ts";
import type { Pop, User, Version } from "./types.ts";
export const dataDir = local.dataDir;
export const hashPassword = local.hashPassword;
export const verifyPassword = local.verifyPassword;
export async function listPops(includeInactive = false): Promise<Pop[]> {
  return cloudEnabled()
    ? rpc("list_pops", { includeInactive })
    : local.listPops(includeInactive);
}
export async function getPop(id: string): Promise<Pop | undefined> {
  return cloudEnabled()
    ? ((await rpc<Pop | null>("get_pop", { id })) ?? undefined)
    : local.getPop(id);
}
export async function savePop(pop: Pop) {
  return cloudEnabled() ? rpc("save_pop", { pop }) : local.savePop(pop);
}
export async function deletePop(id: string) {
  return cloudEnabled() ? rpc("delete_pop", { id }) : local.deletePop(id);
}
export async function incrementViews(id: string) {
  return cloudEnabled()
    ? rpc("increment_views", { id })
    : local.incrementViews(id);
}
export async function versions(id: string): Promise<Version[]> {
  return cloudEnabled() ? rpc("versions", { id }) : local.versions(id);
}
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "member" = "member",
) {
  if (!cloudEnabled()) return local.createUser(name, email, password, role);
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
  return rpc<string>("create_user", {
    id: randomUUID(),
    name,
    email: identity,
    password: hashPassword(password),
    role,
  });
}
export async function listUsers(): Promise<User[]> {
  return cloudEnabled() ? rpc("list_users") : local.listUsers();
}
export async function toggleMember(id: string) {
  return cloudEnabled() ? rpc("toggle_member", { id }) : local.toggleMember(id);
}
export async function resetMemberPassword(id: string, password: string) {
  if (!cloudEnabled()) return local.resetMemberPassword(id, password);
  if (password.length < 12 || password.length > 128)
    throw new Error("A senha deve ter entre 12 e 128 caracteres.");
  return rpc("reset_password", { id, password: hashPassword(password) });
}
const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function login(email: string, password: string): Promise<string> {
  if (!cloudEnabled()) return local.login(email, password);
  const identity = email.trim().toLowerCase();
  const row = await rpc<(User & { password: string }) | null>("login_user", {
    email: identity,
  });
  const valid = verifyPassword(
    password,
    row?.password ?? hashPassword("unused-password-value"),
  );
  const token = randomBytes(32).toString("hex");
  const result = await rpc<string>("login_finish", {
    email: identity,
    valid: Boolean(row?.active && valid),
    passwordHash: row?.password,
    hash: tokenHash(token),
  });
  if (result === "blocked")
    throw new Error(
      "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
    );
  if (result !== "ok") throw new Error("Usuário, e-mail ou senha incorretos.");
  return token;
}
export async function sessionUser(token: string): Promise<User | undefined> {
  return cloudEnabled()
    ? ((await rpc<User | null>("session_user", { hash: tokenHash(token) })) ??
        undefined)
    : local.sessionUser(token);
}
export async function endSession(token: string) {
  return cloudEnabled()
    ? rpc("end_session", { hash: tokenHash(token) })
    : local.endSession(token);
}
export async function hasAdministrator() {
  return cloudEnabled()
    ? rpc<boolean>("has_admin")
    : Boolean(
        local.db().prepare("SELECT id FROM users WHERE role='admin'").get(),
      );
}
export async function createInitialAdmin(password: string) {
  // Remote create_user is one transaction; the unique index prevents concurrent activation.
  if (cloudEnabled())
    return createUser("Anelise Piedade", "anelisepiedade", password, "admin");
  const database = local.db();
  database.exec("BEGIN IMMEDIATE");
  try {
    local.createUser("Anelise Piedade", "anelisepiedade", password, "admin");
    database
      .prepare("DELETE FROM login_attempts WHERE key=?")
      .run(tokenHash("anelisepiedade"));
    database.exec("COMMIT");
  } catch (e) {
    database.exec("ROLLBACK");
    throw e;
  }
}
