import { NextRequest } from "next/server";
import { readPdf } from "@/lib/documents";
import { currentUser } from "@/lib/auth";
import { listPops, versions } from "@/lib/db";
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
  const pops = await listPops(user.role === "admin");
  let owner = pops.find((p) => p.pdfId === id);
  if (!owner && user.role === "admin") {
    for (const pop of pops) {
      if ((await versions(pop.id)).some((v) => v.snapshot.pdfId === id)) {
        owner = pop;
        break;
      }
    }
  }
  if (!owner) return new Response("Não encontrado", { status: 404 });
  try {
    const file = await readPdf(id);
    const download = request.nextUrl.searchParams.has("download");
    return new Response(Buffer.from(file), {
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
