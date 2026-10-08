import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { cloudConfig, cloudEnabled } from "../lib/cloud.ts";
import type { Pop } from "../lib/types.ts";

test("Nuvem: PostgreSQL executa migração, protege acesso público e preserva contas, versões e sessões", async () => {
  const pg = new PGlite();
  try {
    await pg.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
    const migration = await readFile(
      new URL("../supabase/setup.sql", import.meta.url),
      "utf8",
    );
    await pg.exec(migration);
    const password = randomBytes(32).toString("hex");
    process.env.POPS_BACKEND = "supabase";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = randomBytes(32).toString("hex");
    process.env.ADMIN_SETUP_CODE = randomBytes(32).toString("hex");
    const originalFetch = globalThis.fetch;
    const objects = new Map<string, Uint8Array>();
    globalThis.fetch = async (input, init) => {
      assert.equal(init?.cache, "no-store");
      const url = String(input);
      if (url.includes("/rest/v1/rpc/")) {
        const { operation, args } = JSON.parse(String(init?.body));
        try {
          const r = await pg.query<{ value: unknown }>(
            "select public.pops_upa($1,$2::jsonb) as value",
            [operation, JSON.stringify(args)],
          );
          return Response.json(r.rows[0].value);
        } catch (e) {
          const duplicate = (e as { code?: string }).code === "23505";
          return new Response("private provider error", {
            status: duplicate ? 409 : 500,
          });
        }
      }
      const id = url.split("/").at(-1)!;
      if (init?.method === "POST") {
        objects.set(id, new Uint8Array(init.body as Uint8Array));
        return new Response(null, { status: 200 });
      }
      const bytes = objects.get(id);
      return bytes
        ? new Response(Buffer.from(bytes))
        : new Response(null, { status: 404 });
    };
    try {
      const store = await import("../lib/db.ts");
      const setup = await import("../lib/setup.ts");
      const pdf = await import("../lib/documents.ts");
      assert.equal(cloudEnabled(), true);
      await setup.initializeAdmin(
        process.env.ADMIN_SETUP_CODE!,
        password,
        password,
      );
      await assert.rejects(
        setup.initializeAdmin(
          process.env.ADMIN_SETUP_CODE!,
          password,
          password,
        ),
        /disponível/,
      );
      const adminToken = await store.login("ANELISEPIEDADE", password);
      assert.equal((await store.sessionUser(adminToken))?.role, "admin");
      await assert.rejects(
        store.createUser("Outra", "other@example.test", password, "admin"),
        /cadastro/,
      );
      assert.equal("password" in (await store.listUsers())[0], false);
      const member = await store.createUser(
        "Equipe",
        "member@example.test",
        password,
      );
      const memberToken = await store.login("member@example.test", password);
      assert.equal((await store.sessionUser(memberToken))?.role, "member");
      await store.toggleMember(member);
      assert.equal(await store.sessionUser(memberToken), undefined);
      await assert.rejects(
        store.login("member@example.test", password),
        /incorretos/,
      );
      await store.toggleMember(member);
      const second = await store.login("member@example.test", password);
      await store.resetMemberPassword(member, password + "2");
      assert.equal(await store.sessionUser(second), undefined);
      await assert.rejects(
        store.login("member@example.test", password),
        /incorretos/,
      );
      const refreshed = await store.login(
        "member@example.test",
        password + "2",
      );
      assert.equal((await store.sessionUser(refreshed))?.role, "member");
      for (let i = 0; i < 5; i++)
        await assert.rejects(
          store.login("unknown@example.test", "wrong"),
          /incorretos/,
        );
      await assert.rejects(
        store.login("unknown@example.test", "wrong"),
        /15 minutos/,
      );
      const pdfId = await pdf.storePdf(
        new File(["%PDF-1.4\n%%EOF"], "test.pdf"),
      );
      assert.equal(
        Buffer.from(await pdf.readPdf(pdfId)).toString(),
        "%PDF-1.4\n%%EOF",
      );
      const p: Pop = {
        id: randomUUID(),
        title: "Teste",
        code: "TEST-001",
        category: "enfermagem",
        description: "Documento teste",
        keywords: "teste",
        version: "1.0",
        createdAt: "2026-10-08",
        updatedAt: "2026-10-08",
        author: "Equipe",
        approvedBy: "Direção",
        pdfId,
        status: "active",
        views: 0,
        isFeatured: false,
        demo: true,
        content: {},
      };
      await store.savePop(p);
      await assert.rejects(
        store.savePop({ ...p, id: randomUUID(), code: "test-001" }),
        /código/,
      );
      assert.equal((await store.versions(p.id)).length, 0);
      await store.incrementViews(p.id);
      await store.savePop({ ...p, status: "inactive", version: "2.0" });
      assert.equal((await store.getPop(p.id))?.views, 1);
      assert.equal((await store.listPops()).length, 0);
      assert.equal((await store.versions(p.id))[0].snapshot.pdfId, pdfId);
      await pg.exec(migration); // deployment/restart does not reset data
      assert.equal((await store.listUsers()).length, 2);
      assert.equal((await store.sessionUser(adminToken))?.role, "admin");
      const bucket = await pg.query<{ public: boolean }>(
        "select public from storage.buckets where id='pops-upa-private'",
      );
      assert.equal(bucket.rows[0].public, false);
      const access = await pg.query<{ allowed: boolean }>(
        "select has_function_privilege('anon','public.pops_upa(text,jsonb)','EXECUTE') as allowed",
      );
      assert.equal(access.rows[0].allowed, false);
      await pg.exec("set role anon");
      await assert.rejects(
        pg.query("select * from public.pops_upa_users"),
        /permission denied/,
      );
      await assert.rejects(
        pg.query("select public.pops_upa('list_users','{}')"),
        /permission denied/,
      );
      await pg.exec("reset role; set role service_role");
      const service = await pg.query<{ value: unknown[] }>(
        "select public.pops_upa('list_users','{}') as value",
      );
      assert.equal(service.rows[0].value.length, 2);
      await pg.exec("reset role");
      await store.deletePop(p.id);
      assert.equal((await store.versions(p.id)).length, 0);
      await store.endSession(adminToken);
      assert.equal(await store.sessionUser(adminToken), undefined);
    } finally {
      globalThis.fetch = originalFetch;
    }
  } finally {
    await pg.close();
  }
});

test("Configuração incompleta não recua para um banco temporário", () => {
  process.env.POPS_BACKEND = "supabase";
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.throws(cloudConfig, /Configure/);
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
  process.env.SUPABASE_URL = "http://example.supabase.co";
  assert.throws(cloudConfig, /HTTPS/);
  process.env.POPS_BACKEND = "invalid";
  assert.throws(cloudEnabled, /local ou supabase/);
});
