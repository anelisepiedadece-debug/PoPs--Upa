import { createUser } from "../lib/db.ts";
const email =
  process.env.ADMIN_LOGIN || process.env.ADMIN_EMAIL || "anelisepiedade";
const password = process.env.ADMIN_PASSWORD;
if (!password) {
  console.error(
    "Defina ADMIN_PASSWORD e, opcionalmente, ADMIN_LOGIN (12 a 128 caracteres) apenas para este comando. Consulte o README.",
  );
  process.exit(1);
}
try {
  createUser(
    process.env.ADMIN_NAME || "Anelise Piedade",
    email,
    password,
    "admin",
  );
  console.log(
    "Conta administrativa criada. Nenhuma senha foi exibida ou salva no código.",
  );
} catch (e) {
  console.error(
    e instanceof Error ? e.message : "Não foi possível criar a conta.",
  );
  process.exit(1);
}
