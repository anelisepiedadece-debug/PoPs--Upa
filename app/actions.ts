"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  createUser,
  deletePop,
  endSession,
  getPop,
  login,
  resetMemberPassword,
  savePop,
  toggleMember,
} from "@/lib/db";
import { storePdf } from "@/lib/documents";
import { initializeAdmin, adminLogin } from "@/lib/setup";
import { categories, sections, type Pop } from "@/lib/types";
export type FormState = { error?: string; success?: string };
const message = (e: unknown) =>
  e instanceof Error
    ? e.message
    : "Não foi possível concluir. Tente novamente.";
export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  let token: string;
  if (email.length > 254 || password.length > 128 || !email || !password)
    return { error: "Informe usuário ou e-mail e senha válidos." };
  try {
    token = login(email, password);
  } catch (e) {
    return { error: message(e) };
  }
  (await cookies()).set("pops_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 3600,
  });
  redirect("/");
}

export async function firstAccessAction(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const code = String(form.get("activationCode") || "");
  const password = String(form.get("password") || "");
  const confirmation = String(form.get("confirmation") || "");
  try {
    initializeAdmin(code, password, confirmation);
  } catch (e) {
    return { error: message(e) };
  }
  const token = login(adminLogin, password);
  (await cookies()).set("pops_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 3600,
  });
  redirect("/admin");
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get("pops_session")?.value;
  if (token) endSession(token);
  jar.delete("pops_session");
  redirect("/login");
}
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Data inválida.",
  );
const schema = z.object({
  title: z.string().trim().min(3).max(180),
  code: z.string().trim().min(2).max(50),
  category: z.string().refine((c) => categories.some((v) => v.slug === c)),
  description: z.string().trim().min(5).max(1500),
  keywords: z.string().max(500),
  version: z.string().trim().min(1).max(30),
  createdAt: date,
  updatedAt: date,
  author: z.string().trim().min(2).max(180),
  approvedBy: z.string().trim().min(2).max(180),
  status: z.enum(["active", "inactive"]),
});
export async function savePopAction(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  let id = "";
  try {
    const parsed = schema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success)
      return {
        error: "Revise os campos obrigatórios, as datas e os limites de texto.",
      };
    const data = parsed.data;
    if (data.updatedAt < data.createdAt)
      return { error: "A atualização não pode ser anterior à criação." };
    id = String(form.get("id") || "") || randomUUID();
    const old = getPop(id);
    if (form.get("id") && !old) return { error: "POP não encontrado." };
    const content: Record<string, string> = {};
    for (const section of sections) {
      const value = String(form.get(section) || "").trim();
      if (value.length > 20000)
        return { error: "Cada seção deve ter no máximo 20 mil caracteres." };
      content[section] = value;
    }
    let pdfId = old?.pdfId ?? null;
    const file = form.get("pdf");
    if (file instanceof File && file.size > 0) pdfId = await storePdf(file);
    const pop: Pop = {
      ...data,
      id,
      content,
      pdfId,
      views: old?.views ?? 0,
      isFeatured: form.get("isFeatured") === "on",
      demo: form.get("demo") === "on",
    };
    savePop(pop);
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/", "layout");
  redirect("/pops/" + id);
}
export async function removePopAction(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("id") || "");
  deletePop(id);
  revalidatePath("/", "layout");
  return { success: "POP excluído do acervo." };
}
export async function createMemberAction(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  const data = z
    .object({
      name: z.string().trim().min(2).max(180),
      email: z.email().max(254),
      password: z.string().min(12).max(128),
    })
    .safeParse(Object.fromEntries(form.entries()));
  if (!data.success)
    return {
      error: "Informe nome, e-mail válido e senha entre 12 e 128 caracteres.",
    };
  try {
    createUser(data.data.name, data.data.email, data.data.password);
  } catch {
    return {
      error:
        "Não foi possível cadastrar. Verifique se o e-mail já está em uso.",
    };
  }
  revalidatePath("/admin/equipe");
  return {
    success:
      "Integrante cadastrado. Entregue as credenciais por um canal privado.",
  };
}
export async function toggleMemberAction(form: FormData) {
  await requireAdmin();
  toggleMember(String(form.get("id")));
  revalidatePath("/admin/equipe");
}
export async function resetPasswordAction(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  try {
    resetMemberPassword(String(form.get("id")), String(form.get("password")));
  } catch (e) {
    return { error: message(e) };
  }
  return { success: "Senha redefinida e sessões anteriores encerradas." };
}
