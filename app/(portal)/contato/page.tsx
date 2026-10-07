import { Building2, Users, ShieldCheck } from "lucide-react";
export default function ContactPage() {
  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">FALE COM A ADMINISTRADORA</span>
          <h1>Contato e suporte</h1>
          <p>Um canal próximo para manter nosso acervo sempre atualizado.</p>
        </div>
      </div>
      <div className="goals-grid">
        <section className="panel">
          <Building2 className="teal-text" size={30} />
          <h2>Nossa unidade</h2>
          <p>Policlínica 24h / UPA</p>
          <p>Nova Santa Rita – RS</p>
        </section>
        <section className="panel">
          <Users className="teal-text" size={30} />
          <h2>Responsável pelo projeto</h2>
          <p>Anelise Piedade</p>
          <p className="muted">
            Para solicitar acesso, corrigir informações ou enviar um POP,
            procure a administradora pelos canais internos da unidade.
          </p>
        </section>
        <section className="panel">
          <ShieldCheck className="teal-text" size={30} />
          <h2>Uso institucional</h2>
          <p className="muted">
            Não compartilhe sua senha. Os links dos POPs só podem ser abertos
            por profissionais com acesso autorizado.
          </p>
        </section>
      </div>
    </div>
  );
}
