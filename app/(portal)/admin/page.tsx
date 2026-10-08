import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  FileText,
  Users,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { listPops, listUsers } from "@/lib/db";
import AdminHeader from "@/components/AdminHeader";
export default async function AdminPage() {
  await requireAdmin();
  const pops = await listPops(true);
  const users = await listUsers();
  return (
    <>
      <AdminHeader
        title="Seu acervo, seu cuidado."
        description="Bem-vinda, Anelise. Gerencie os documentos e o acesso da equipe."
        add
      />
      <div className="admin-stats">
        <div className="panel">
          <FileText />
          <strong>{pops.length}</strong>
          <span>POPs cadastrados</span>
        </div>
        <div className="panel">
          <ShieldCheck />
          <strong>{pops.filter((p) => p.status === "active").length}</strong>
          <span>Documentos ativos</span>
        </div>
        <div className="panel">
          <Users />
          <strong>
            {users.filter((u) => u.role === "member" && u.active).length}
          </strong>
          <span>Integrantes com acesso</span>
        </div>
        <div className="panel">
          <Eye />
          <strong>{pops.reduce((s, p) => s + p.views, 0)}</strong>
          <span>Consultas registradas</span>
        </div>
      </div>
      <div className="panel">
        <h2>Comece por aqui</h2>
        <p className="muted">
          Cadastre os documentos institucionais aprovados e convide sua equipe
          para consultar.
        </p>
        <div className="button-row">
          <Link href="/admin/pops/novo" className="button primary">
            <Plus size={18} />
            Cadastrar novo POP
          </Link>
          <Link href="/admin/equipe" className="button secondary">
            <Users size={18} />
            Gerenciar equipe
          </Link>
        </div>
      </div>
      <section className="panel">
        <h2>Últimas atualizações</h2>
        {[...pops]
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .slice(0, 5)
          .map((p) => (
            <Link
              className="admin-recent"
              key={p.id}
              href={"/admin/pops/" + p.id + "/editar"}
            >
              <FileText size={19} />
              <span>
                <strong>{p.title}</strong>
                <small>
                  {p.code} · Versão {p.version}
                  {p.demo ? " · Demonstração" : ""}
                </small>
              </span>
              <ArrowRight size={17} />
            </Link>
          ))}
      </section>
    </>
  );
}
