import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { currentUser } from "@/lib/auth";
import { dataDir, listPops, versions } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return new Response("Acesso restrito", { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id))
    return new Response("Não encontrado", { status: 404 });
  const owner = listPops(user.role === "admin").find(
    (p) =>
      p.pdfId === id ||
      (user.role === "admin" &&
        versions(p.id).some((v) => v.snapshot.pdfId === id)),
  );
  if (!owner) return new Response("Não encontrado", { status: 404 });
  try {
    const file = await readFile(path.join(dataDir, "documents", id + ".pdf"));
    const download = request.nextUrl.searchParams.has("download");
    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${owner.code.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "frame-ancestors 'self'",
      },
    });
  } catch {
    return new Response("Arquivo indisponível", { status: 404 });
  }
}
