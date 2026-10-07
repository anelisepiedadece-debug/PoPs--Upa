import Link from "next/link";
import { setupAvailable } from "@/lib/setup";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  HeartPulse,
  ShieldCheck,
  FileText,
  Search,
  Smartphone,
  ArrowUpRight,
} from "lucide-react";
import { LoginForm } from "@/components/Forms";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  return (
    <main id="main" className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-icon">
            <HeartPulse size={30} />
          </span>
          <span>
            <strong>POPs UPA</strong>
            <small>Conhecimento na Palma da Mão</small>
          </span>
        </div>
        <div className="login-story-content">
          <span className="eyebrow">CUIDAR COMEÇA COM CONHECIMENTO</span>
          <h1>
            Informação acessível.
            <br />
            <em>Assistência mais segura.</em>
          </h1>
          <p>
            Os procedimentos da nossa unidade, organizados em um só lugar. Para
            consultar onde e quando você precisar.
          </p>
          <div className="login-features">
            <span>
              <Search />
              Encontre em segundos
            </span>
            <span>
              <FileText />
              Consulte a versão vigente
            </span>
            <span>
              <Smartphone />
              Leve com você
            </span>
          </div>
          <div className="login-document">
            <span className="document-icon">
              <FileText size={28} />
            </span>
            <div>
              <strong>Seu acervo institucional</strong>
              <p>Organizado. Atualizado. Ao seu alcance.</p>
            </div>
            <ArrowUpRight />
          </div>
        </div>
        <p className="login-credit">
          Policlínica 24h / UPA · Nova Santa Rita – RS
        </p>
      </section>
      <section className="login-form-side">
        <div className="login-form-card">
          <span className="secure-icon">
            <ShieldCheck size={28} />
          </span>
          <h2>Bem-vinda à nossa equipe</h2>
          <p className="muted">
            Entre para acessar os procedimentos da unidade.
          </p>
          <LoginForm />
          {setupAvailable() && (
            <Link href="/primeiro-acesso" className="first-access-link">
              Sou Anelise — configurar meu primeiro acesso
            </Link>
          )}
          <div className="login-lock">
            <ShieldCheck size={16} />
            Acesso exclusivo para profissionais autorizados
          </div>
        </div>
        <p className="login-signature">
          Projeto desenvolvido por Anelise Piedade
          <br />
          Aprovado por Lilian Silva – Diretora Geral
        </p>
      </section>
    </main>
  );
}
