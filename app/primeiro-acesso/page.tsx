import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { hasAdmin, setupAvailable } from "@/lib/setup";
import { FirstAccessForm } from "@/components/Forms";
export const dynamic = "force-dynamic";
export default async function FirstAccessPage() {
  if (await hasAdmin())
    redirect((await currentUser())?.role === "admin" ? "/admin" : "/login");
  return (
    <main id="main" className="setup-page">
      <section className="setup-card">
        <div className="brand">
          <span className="brand-icon">
            <HeartPulse size={27} />
          </span>
          <span>
            <strong>POPs UPA</strong>
            <small>Conhecimento na Palma da Mão</small>
          </span>
        </div>
        <span className="secure-icon">
          <ShieldCheck size={28} />
        </span>
        <h1>Seu primeiro acesso</h1>
        <p className="muted">
          Anelise, defina sua senha para gerenciar os POPs e liberar o acesso da
          equipe.
        </p>
        {(await setupAvailable()) ? (
          <FirstAccessForm />
        ) : (
          <div className="institutional-notice">
            <p>
              O primeiro acesso ainda não foi liberado. Solicite o código de
              ativação ao responsável pela implantação.
            </p>
          </div>
        )}
        <Link className="back-link" href="/login">
          ← Voltar ao login da equipe
        </Link>
      </section>
    </main>
  );
}
