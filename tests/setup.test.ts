import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
const folder = mkdtempSync(path.join(tmpdir(), "pops-bootstrap-"));
process.env.POPS_DATA_DIR = folder;
process.env.POPS_SEED_DEMO = "false";
process.env.POPS_BACKEND = "local";
const store = await import("../lib/db.ts");
const local = await import("../lib/local-db.ts");
const setup = await import("../lib/setup.ts");
test("Primeiro acesso: exige código privado, valida senha, cria anelisepiedade e não permite segunda ativação", async () => {
  assert.equal(await setup.setupAvailable(), false);
  await assert.rejects(
    () => setup.initializeAdmin("invalid", "wrong", "wrong"),
    /não está disponível/,
  );
  process.env.ADMIN_SETUP_CODE = randomBytes(32).toString("hex");
  const password = randomBytes(24).toString("hex");
  assert.equal(await setup.setupAvailable(), true);
  await assert.rejects(
    () => setup.initializeAdmin("invalid", password, password),
    /Código/,
  );
  await assert.rejects(
    () =>
      setup.initializeAdmin(process.env.ADMIN_SETUP_CODE!, "short", "short"),
    /12/,
  );
  await assert.rejects(
    () =>
      setup.initializeAdmin(
        process.env.ADMIN_SETUP_CODE!,
        password,
        password + "wrong",
      ),
    /iguais/,
  );
  assert.equal((await store.listUsers()).length, 0);
  for (let i = 0; i < 5; i++)
    await assert.rejects(
      () => store.login(setup.adminLogin, "invalid-password"),
      /incorretos/,
    );
  await setup.initializeAdmin(
    process.env.ADMIN_SETUP_CODE!,
    password,
    password,
  );
  assert.equal(await setup.hasAdmin(), true);
  assert.equal(await setup.setupAvailable(), false);
  assert.equal(
    (await store.sessionUser(await store.login("ANELISEPIEDADE", password)))
      ?.role,
    "admin",
  );
  await assert.rejects(
    () =>
      setup.initializeAdmin(process.env.ADMIN_SETUP_CODE!, password, password),
    /não está disponível/,
  );
  assert.equal((await store.listUsers()).length, 1);
});
process.on("exit", () => {
  local.db().close();
  rmSync(folder, { recursive: true, force: true });
});
