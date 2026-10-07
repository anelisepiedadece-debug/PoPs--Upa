import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
const folder = mkdtempSync(path.join(tmpdir(), "pops-bootstrap-"));
process.env.POPS_DATA_DIR = folder;
process.env.POPS_SEED_DEMO = "false";
const store = await import("../lib/db.ts");
const setup = await import("../lib/setup.ts");
test("Primeiro acesso: exige código privado, valida senha, cria anelisepiedade e não permite segunda ativação", () => {
  assert.equal(setup.setupAvailable(), false);
  assert.throws(
    () => setup.initializeAdmin("invalid", "wrong", "wrong"),
    /não está disponível/,
  );
  process.env.ADMIN_SETUP_CODE = randomBytes(32).toString("hex");
  const password = randomBytes(24).toString("hex");
  assert.equal(setup.setupAvailable(), true);
  assert.throws(
    () => setup.initializeAdmin("invalid", password, password),
    /Código/,
  );
  assert.throws(
    () =>
      setup.initializeAdmin(process.env.ADMIN_SETUP_CODE!, "short", "short"),
    /12/,
  );
  assert.throws(
    () =>
      setup.initializeAdmin(
        process.env.ADMIN_SETUP_CODE!,
        password,
        password + "wrong",
      ),
    /iguais/,
  );
  assert.equal(store.listUsers().length, 0);
  for (let i = 0; i < 5; i++)
    assert.throws(
      () => store.login(setup.adminLogin, "invalid-password"),
      /incorretos/,
    );
  setup.initializeAdmin(process.env.ADMIN_SETUP_CODE!, password, password);
  assert.equal(setup.hasAdmin(), true);
  assert.equal(setup.setupAvailable(), false);
  assert.equal(
    store.sessionUser(store.login("ANELISEPIEDADE", password))?.role,
    "admin",
  );
  assert.throws(
    () =>
      setup.initializeAdmin(process.env.ADMIN_SETUP_CODE!, password, password),
    /não está disponível/,
  );
  assert.equal(store.listUsers().length, 1);
});
process.on("exit", () => {
  store.db().close();
  rmSync(folder, { recursive: true, force: true });
});
