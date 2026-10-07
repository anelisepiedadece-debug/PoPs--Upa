import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { getPop, incrementViews } from "@/lib/db";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return new Response("Origem inválida", { status: 403 });
  const user = await currentUser();
  if (!user) return new Response("Acesso restrito", { status: 401 });
  let id: string;
  try {
    const body = await request.json();
    id = String(body.id);
  } catch {
    return new Response("Requisição inválida", { status: 400 });
  }
  const pop = getPop(id);
  if (!pop || (pop.status === "inactive" && user.role !== "admin"))
    return new Response("Não encontrado", { status: 404 });
  incrementViews(id);
  return new Response(null, { status: 204 });
}
