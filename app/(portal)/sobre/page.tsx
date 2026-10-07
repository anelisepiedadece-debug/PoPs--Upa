import {
  Search,
  ShieldCheck,
  GraduationCap,
  Leaf,
  FolderOpen,
  HeartPulse,
  Smartphone,
  Clock3,
  RefreshCw,
} from "lucide-react";
const goals = [
  {
    icon: Search,
    title: "Acesso rápido",
    text: "Facilitar a consulta aos POPs durante a rotina de trabalho.",
  },
  {
    icon: HeartPulse,
    title: "Padronização",
    text: "Auxiliar na padronização das condutas e procedimentos.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    text: "Contribuir para a segurança do paciente e dos profissionais.",
  },
  {
    icon: GraduationCap,
    title: "Educação permanente",
    text: "Facilitar a atualização e a integração dos profissionais.",
  },
  {
    icon: FolderOpen,
    title: "Organização",
    text: "Centralizar os documentos institucionais em um só lugar.",
  },
  {
    icon: Leaf,
    title: "Sustentabilidade",
    text: "Reduzir a necessidade de impressão de documentos.",
  },
];
export default function AboutPage() {
  return (
    <div className="container page">
      <div className="about-intro">
        <span className="eyebrow">SOBRE O PROJETO</span>
        <h1>
          Conhecimento que aproxima.
          <br />
          <span>Cuidado que transforma.</span>
        </h1>
        <p>POPs UPA — Conhecimento na Palma da Mão</p>
      </div>
      <section className="panel about-text">
        <h2>Tecnologia como apoio à assistência</h2>
        <p>
          O projeto POPs UPA – Conhecimento na Palma da Mão foi desenvolvido com
          o objetivo de facilitar o acesso dos profissionais aos Procedimentos
          Operacionais Padrão utilizados na Policlínica 24h / UPA.
        </p>
        <p>
          A proposta é reunir os documentos institucionais em um único ambiente
          digital, permitindo uma consulta rápida, organizada e acessível por
          celular, tablet ou computador.
        </p>
        <p>
          O projeto busca utilizar a tecnologia como ferramenta de apoio à
          assistência, educação permanente, padronização dos procedimentos e
          segurança do paciente.
        </p>
        <div className="project-credits">
          <div>
            <small>Desenvolvido por</small>
            <strong>Anelise Piedade</strong>
          </div>
          <div>
            <small>Aprovado por</small>
            <strong>Lilian Silva – Diretora Geral</strong>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NOSSO PROPÓSITO</span>
            <h2>Objetivos do projeto</h2>
          </div>
        </div>
        <div className="goals-grid">
          {goals.map((g) => (
            <article className="panel goal-card" key={g.title}>
              <span className="category-icon teal">
                <g.icon size={25} />
              </span>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="panel why-site">
        <h2>Por que um site?</h2>
        <div className="benefits">
          {[
            [Smartphone, "Acesso pelo celular"],
            [Clock3, "Consulta rápida"],
            [FolderOpen, "Documentos em um único local"],
            [RefreshCw, "Atualizações mais fáceis"],
            [Leaf, "Menor utilização de papel"],
            [GraduationCap, "Educação permanente"],
            [ShieldCheck, "Segurança e padronização"],
          ].map(([Icon, title]) => {
            const I = Icon as typeof Smartphone;
            return (
              <span key={String(title)}>
                <I size={21} />
                {String(title)}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
