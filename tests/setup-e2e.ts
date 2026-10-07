import { createUser } from "../lib/db.ts";
if (!process.env.E2E_PASSWORD) throw new Error("E2E_PASSWORD required");
createUser(
  "Anelise Piedade",
  "admin@example.test",
  process.env.E2E_PASSWORD,
  "admin",
);
createUser("Equipe de teste", "member@example.test", process.env.E2E_PASSWORD);
console.log("Contas de teste criadas em banco isolado.");
