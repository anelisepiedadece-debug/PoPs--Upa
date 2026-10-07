import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { categories, matches, type Pop } from "../lib/types.ts";
const folder = mkdtempSync(path.join(tmpdir(), "pops-unit-"));
process.env.POPS_DATA_DIR = folder;
process.env.POPS_SEED_DEMO = "false";
const store = await import("../lib/db.ts");
const pdf = await import("../lib/documents.ts");
const password = randomUUID() + randomUUID();
test("Contas: hashes, sessões revogáveis, exclusividade da administradora e bloqueio de tentativas", () => {
  const admin = store.createUser(
    "Anelise",
    "admin@example.test",
    password,
    "admin",
  );
  const member = store.createUser("Equipe", "member@example.test", password);
  assert.throws(
    () => store.createUser("Outra", "second@example.test", password, "admin"),
    /Já existe/,
  );
  assert.throws(
    () => store.createUser("Fraca", "weak@example.test", "short"),
    /12/,
  );
  const adminToken = store.login("ADMIN@example.test", password);
  assert.equal(store.sessionUser(adminToken)?.id, admin);
  assert.equal(store.sessionUser(adminToken)?.role, "admin");
  const memberToken = store.login("member@example.test", password);
  assert.equal(store.sessionUser(memberToken)?.role, "member");
  store.toggleMember(member);
  assert.equal(store.sessionUser(memberToken), undefined);
  assert.throws(
    () => store.login("member@example.test", password),
    /incorretos/,
  );
  store.toggleMember(member);
  const secondToken = store.login("member@example.test", password);
  store.resetMemberPassword(member, password + "2");
  assert.equal(store.sessionUser(secondToken), undefined);
  store.endSession(adminToken);
  assert.equal(store.sessionUser(adminToken), undefined);
  for (let i = 0; i < 5; i++)
    assert.throws(
      () => store.login("unknown@example.test", "wrong"),
      /incorretos/,
    );
  assert.throws(
    () => store.login("unknown@example.test", "wrong"),
    /15 minutos/,
  );
  const row = store
    .db()
    .prepare("SELECT password FROM users WHERE id=?")
    .get(admin) as { password: string };
  assert.notEqual(row.password, password);
  assert.equal(store.verifyPassword(password, row.password), true);
});
test("POPs: busca sem acento, unicidade do código, histórico, inativos e exclusão", () => {
  const p: Pop = {
    id: randomUUID(),
    title: "Higienização das Mãos",
    code: "TEST-001",
    category: "controle-de-infeccao",
    description: "Teste de busca por descrição",
    keywords: "limpeza, proteção",
    version: "1.0",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    author: "Equipe",
    approvedBy: "Direção",
    pdfId: null,
    status: "active",
    views: 0,
    isFeatured: false,
    demo: true,
    content: { Objetivo: "Conteúdo de teste" },
  };
  store.savePop(p);
  assert.equal(store.listPops().length, 1);
  assert.ok(matches(p, "higienizacao"));
  assert.ok(matches(p, "proteçao"));
  assert.ok(matches(p, "TEST-001"));
  assert.ok(matches(p, "infecção"));
  assert.ok(matches(p, "descrição"));
  assert.equal(categories.length, 10);
  assert.throws(() => store.savePop({ ...p, id: randomUUID() }), /código/);
  assert.equal(store.listPops().length, 1);
  store.incrementViews(p.id);
  assert.equal(store.getPop(p.id)?.views, 1);
  store.savePop({
    ...p,
    status: "inactive",
    version: "2.0",
    updatedAt: "2026-10-07",
  });
  assert.equal(store.listPops().length, 0);
  assert.equal(store.listPops(true).length, 1);
  assert.equal(store.versions(p.id)[0].snapshot.version, "1.0");
  store.deletePop(p.id);
  assert.equal(store.getPop(p.id), undefined);
  assert.equal(store.versions(p.id).length, 0);
});
test("PDFs: validação do conteúdo, limite e armazenamento privado", async () => {
  await assert.rejects(
    pdf.storePdf(
      new File(["not a PDF"], "bad.pdf", { type: "application/pdf" }),
    ),
    /PDF válido/,
  );
  await assert.rejects(
    pdf.storePdf(new File([new Uint8Array(15 * 1024 * 1024 + 1)], "large.pdf")),
    /15 MB/,
  );
  const id = await pdf.storePdf(
    new File(["%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"], "ok.pdf"),
  );
  assert.match(id, /^[0-9a-f-]{36}$/);
});
process.on("exit", () => {
  store.db().close();
  rmSync(folder, { recursive: true, force: true });
});
