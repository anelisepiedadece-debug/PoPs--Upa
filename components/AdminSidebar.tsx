import Link from "next/link";
import {
  LayoutDashboard,
  Files,
  Users,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-eyebrow">
        <ShieldCheck size={18} /> ADMINISTRAÇÃO
      </div>
      <nav aria-label="Menu administrativo">
        <Link href="/admin">
          <LayoutDashboard size={19} />
          Visão geral
        </Link>
        <Link href="/admin/pops">
          <Files size={19} />
          Gerenciar POPs
        </Link>
        <Link href="/admin/equipe">
          <Users size={19} />
          Acesso da equipe
        </Link>
        <Link href="/">
          <ArrowLeft size={19} />
          Voltar ao acervo
        </Link>
      </nav>
      <div className="sidebar-note">
        <ShieldCheck size={25} />
        <p>Somente sua conta pode alterar documentos e gerenciar a equipe.</p>
      </div>
    </aside>
  );
}
