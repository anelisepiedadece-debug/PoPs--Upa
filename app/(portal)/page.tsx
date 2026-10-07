import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Clock3,
  Smartphone,
  Info,
  BookOpen,
  Sparkles,
  ChevronRight,
  HeartPulse,
  Search,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listPops } from "@/lib/db";
import { categories } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import PopCard from "@/components/PopCard";
import { QRCodeButton } from "@/components/Actions";
export default async function Home() {
  const user = await requireUser();
  const pops = listPops();
  const popular = [...pops]
    .sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) || b.views - a.views,
    )
    .slice(0, 5);
  const recent = [...pops]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">
              <span className="status-dot" /> CONHECIMENTO QUE APOIA O CUIDADO
            </span>
            <h1>
              Conhecimento na
              <br />
              <span>Palma da Mão.</span>
            </h1>
            <p>
              Informação rápida, segura e acessível para apoiar os profissionais
              da UPA e da Policlínica 24h em suas rotinas de trabalho.
            </p>
            <div className="button-row">
              <Link href="/pops" className="button primary">
                Acessar POPs <ArrowRight size={18} />
              </Link>
              <a href="#home-search" className="button hero-secondary">
                <Search size={18} />
                Pesquisar POP
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <ShieldCheck size={16} />
                Uso institucional
              </span>
              <span>
                <Smartphone size={16} />
                Acesso em qualquer dispositivo
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="visual-orbit orbit-1" />
            <div className="visual-orbit orbit-2" />
            <div className="floating-label">
              <ShieldCheck size={19} />
              <span>
                Mais segurança
                <br />
                <strong>em cada cuidado</strong>
              </span>
            </div>
            <div className="document-stack back" />
            <div className="document-stack front">
              <div className="mock-doc-header">
                <span>
                  <HeartPulse size={19} />
                  POPs UPA
                </span>
                <span className="mock-dots">•••</span>
              </div>
              <div className="mock-doc-icon">
                <FileText size={33} />
              </div>
              <small>PROCEDIMENTO OPERACIONAL PADRÃO</small>
              <h3>
                Conhecimento para
                <br />
                cuidar melhor.
              </h3>
              <div className="doc-line long" />
              <div className="doc-line" />
              <div className="doc-line short" />
              <div className="mock-doc-foot">
                <span>
                  <ShieldCheck size={14} />
                  Versão vigente
                </span>
                <span>PDF</span>
              </div>
            </div>
            <div className="floating-check">
              <span>
                <BookOpen size={19} />
              </span>
              <div>
                <strong>Um só lugar.</strong>
                <small>Todos os seus procedimentos.</small>
              </div>
            </div>
            <span className="visual-plus plus-1">+</span>
            <span className="visual-plus plus-2">+</span>
          </div>
        </div>
      </section>
      <div className="container">
        <section className="search-section">
          <div className="search-heading">
            <span className="search-heading-icon">
              <Search size={24} />
            </span>
            <div>
              <h2>Qual POP você está procurando?</h2>
              <p>Pesquise pelo nome, código, categoria ou palavra-chave.</p>
            </div>
          </div>
          <SearchBar pops={pops} />
          <div className="search-hints">
            Acesso rápido:{" "}
            <Link href="/pops?q=higienização">Higienização das mãos</Link>
            <Link href="/pops?q=medicamentos">Medicamentos</Link>
            <Link href="/pops?q=urgência">Urgência</Link>
          </div>
        </section>
        <div className="stats-strip">
          <div>
            <span className="stat-icon">
              <FileText />
            </span>
            <strong>
              {pops.length}
              <small>POPs no acervo</small>
            </strong>
          </div>
          <div>
            <span className="stat-icon">
              <BookOpen />
            </span>
            <strong>
              {categories.length}
              <small>Categorias de consulta</small>
            </strong>
          </div>
          <div>
            <span className="stat-icon">
              <Clock3 />
            </span>
            <strong>
              24h<small>Conhecimento disponível</small>
            </strong>
          </div>
          <div>
            <span className="stat-icon">
              <Smartphone />
            </span>
            <strong>
              Onde precisar<small>No celular, tablet ou computador</small>
            </strong>
          </div>
        </div>
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ENCONTRE POR ÁREA</span>
              <h2>POPs por categoria</h2>
              <p>Organização que acompanha a rotina da sua equipe.</p>
            </div>
            <Link href="/categorias" className="text-link">
              Ver categorias <ArrowRight size={17} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <CategoryCard
                key={c.slug}
                category={c}
                count={pops.filter((p) => p.category === c.slug).length}
              />
            ))}
          </div>
        </section>
        <div className="institutional-notice">
          <Info size={21} />
          <p>
            <strong>Um cuidado importante:</strong> consulte sempre a versão
            mais recente do POP antes da realização do procedimento.
          </p>
        </div>
        {pops.some((p) => p.demo) && (
          <div className="demo-notice">
            <Sparkles size={17} />
            <span>
              O acervo contém exemplos demonstrativos. Eles não são protocolos
              clínicos e devem ser substituídos por documentos institucionais
              aprovados.
            </span>
          </div>
        )}
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NA ROTINA DA EQUIPE</span>
              <h2>POPs mais acessados</h2>
              <p>Seus documentos de referência, a poucos cliques.</p>
            </div>
            <Link href="/pops" className="text-link">
              Ver todos os POPs <ArrowRight size={17} />
            </Link>
          </div>
          {popular.length ? (
            <div className="popular-grid">
              {popular.map((p) => (
                <PopCard key={p.id} pop={p} userId={user.id} compact />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FileText />
              <h3>O acervo está pronto para receber seus POPs</h3>
              <p>A administradora pode começar pelo painel de cadastro.</p>
            </div>
          )}
        </section>
        <section className="section recent-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SEMPRE EM DIA</span>
              <h2>Atualizados recentemente</h2>
              <p>Acompanhe as últimas versões disponíveis.</p>
            </div>
            <span className="updated-pill">
              <span className="status-dot" />
              Conhecimento em evolução
            </span>
          </div>
          <div className="pop-grid">
            {recent.map((p) => (
              <PopCard key={p.id} pop={p} userId={user.id} />
            ))}
          </div>
        </section>
        <section className="about-banner">
          <div className="about-banner-icon">
            <HeartPulse size={37} />
          </div>
          <div>
            <span className="eyebrow">TECNOLOGIA A SERVIÇO DO CUIDADO</span>
            <h2>
              Informação acessível para
              <br />
              uma assistência mais segura.
            </h2>
            <p>
              Um projeto que une conhecimento, educação permanente e compromisso
              com nossa equipe.
            </p>
            <Link className="text-link" href="/sobre">
              Conheça o projeto <ChevronRight size={17} />
            </Link>
          </div>
          <div className="banner-qr">
            <QRCodeButton label="QR Code do acervo" />
            <small>Compartilhe o acesso com a equipe.</small>
          </div>
        </section>
      </div>
    </>
  );
}
