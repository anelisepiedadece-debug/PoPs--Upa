import { createHash, timingSafeEqual } from "node:crypto";
import { hasAdministrator, createInitialAdmin } from "./db.ts";
export const adminLogin = "anelisepiedade";
export async function hasAdmin() {
  return hasAdministrator();
}
export async function setupAvailable() {
  const code = process.env.ADMIN_SETUP_CODE;
  return Boolean(
    code && code.length >= 32 && code.length <= 256 && !(await hasAdmin()),
  );
}
export async function initializeAdmin(
  code: string,
  password: string,
  confirmation: string,
) {
  if (!(await setupAvailable()))
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
  await createInitialAdmin(password);
}
