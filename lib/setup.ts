import { createHash, timingSafeEqual } from "node:crypto";
import { createUser, db } from "./db.ts";
export const adminLogin = "anelisepiedade";
export function hasAdmin() {
  return Boolean(db().prepare("SELECT id FROM users WHERE role='admin'").get());
}
export function setupAvailable() {
  const code = process.env.ADMIN_SETUP_CODE;
  return Boolean(
    code && code.length >= 32 && code.length <= 256 && !hasAdmin(),
  );
}
export function initializeAdmin(
  code: string,
  password: string,
  confirmation: string,
) {
  if (!setupAvailable())
    throw new Error("O primeiro acesso não está disponível.");
  if (
    code.length > 256 ||
    !timingSafeEqual(
      createHash("sha256").update(code).digest(),
      createHash("sha256").update(process.env.ADMIN_SETUP_CODE!).digest(),
    )
  )
    throw new Error("Código de ativação inválido.");
  if (password !== confirmation)
    throw new Error("As senhas precisam ser iguais.");
  if (password.length < 12 || password.length > 128)
    throw new Error("Escolha uma senha entre 12 e 128 caracteres.");
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try {
    if (hasAdmin()) throw new Error("A conta administrativa já foi criada.");
    createUser("Anelise Piedade", adminLogin, password, "admin");
    database
      .prepare("DELETE FROM login_attempts WHERE key=?")
      .run(createHash("sha256").update(adminLogin).digest("hex"));
    database.exec("COMMIT");
  } catch (e) {
    database.exec("ROLLBACK");
    throw e;
  }
}
