import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "./db";
export async function currentUser() {
  const token = (await cookies()).get("pops_session")?.value;
  return token ? sessionUser(token) : undefined;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
