import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Pencil, History, ShieldCheck, Info } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPop, versions } from "@/lib/db";
import { categoryName, dateLabel, sections } from "@/lib/types";
import {
  FavoriteButton,
  ShareButton,
  QRCodeButton,
  ViewCounter,
} from "@/components/Actions";
import PDFViewer from "@/components/PDFViewer";
export default async function PopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const p = getPop(id);
  if (!p || (p.status === "inactive" && user.role !== "admin")) notFound();
  const history = versions(id);
  return (
    <div className="container page">
      <ViewCounter id={id} />
      <Link className="back-link" href="/pops">
        ← Voltar aos POPs
      </Link>
      <div className="detail-heading">
        <span className="document-icon large">
          <FileText size={30} />
        </span>
        <div>
          <div className="tag-row">
            <span className="tag">{categoryName(p.category)}</span>
            {p.demo && <span className="demo-tag">Demonstração</span>}
            {p.status === "inactive" && (
              <span className="demo-tag">Inativo</span>
            )}
          </div>
          <h1>{p.title}</h1>
          <p>{p.description}</p>
          <span className="pop-code">{p.code}</span>
        </div>
      </div>
      {p.demo && (
        <div className="demo-notice">
          <Info size={20} />
          <span>
            Exemplo de organização do acervo. Este documento não contém
            orientações clínicas aprovadas e não deve ser usado na assistência.
          </span>
        </div>
      )}
      <div className="button-row detail-actions">
        <FavoriteButton id={id} userId={user.id} label />
        <ShareButton title={p.title} />
        <QRCodeButton />
        {user.role === "admin" && (
          <Link
            className="button secondary"
            href={"/admin/pops/" + id + "/editar"}
          >
            <Pencil size={17} />
            Editar POP
          </Link>
        )}
      </div>
      <div className="detail-layout">
        <div>
          <section className="panel">
            <h2>Documento institucional</h2>
            <PDFViewer id={p.pdfId} title={p.title} />
          </section>
          <section className="panel document-content">
            <h2>Conteúdo de consulta</h2>
            {sections.some((s) => p.content[s]) ? (
              sections
                .filter((s) => p.content[s])
                .map((s) => (
                  <section key={s}>
                    <h3>{s}</h3>
                    <p>{p.content[s]}</p>
                  </section>
                ))
            ) : (
              <p className="muted">
                O conteúdo textual ainda não foi cadastrado. Consulte o PDF
                institucional quando disponível.
              </p>
            )}
          </section>
        </div>
        <aside>
          <section className="panel metadata-panel">
            <span className="current-version">
              <ShieldCheck size={17} />
              {p.demo
                ? "Versão demonstrativa"
                : p.status === "inactive"
                  ? "Versão inativa"
                  : "Versão vigente"}
            </span>
            <h2>Versão {p.version}</h2>
            <dl>
              <dt>Categoria</dt>
              <dd>{categoryName(p.category)}</dd>
              <dt>Data de criação</dt>
              <dd>{dateLabel(p.createdAt)}</dd>
              <dt>Última atualização</dt>
              <dd>{dateLabel(p.updatedAt)}</dd>
              <dt>Elaborado por</dt>
              <dd>{p.author}</dd>
              <dt>Aprovado por</dt>
              <dd>{p.approvedBy}</dd>
            </dl>
          </section>
          <section className="panel">
            <h2 className="icon-heading">
              <History size={20} />
              Histórico de versões
            </h2>
            <div className="version-item">
              <span className="status-dot" />
              <div>
                <strong>Versão {p.version}</strong>
                <small>
                  {dateLabel(p.updatedAt)} ·{" "}
                  {p.status === "active" ? "Atual" : "Inativa"}
                </small>
              </div>
            </div>
            {history.map((v) => (
              <div className="version-item" key={v.id}>
                <span className="version-dot" />
                <div>
                  <strong>Versão {v.version}</strong>
                  <small>{dateLabel(v.date)}</small>
                  {user.role === "admin" && v.snapshot.pdfId && (
                    <a
                      href={"/api/documents/" + v.snapshot.pdfId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      PDF anterior
                    </a>
                  )}
                </div>
              </div>
            ))}
            {!history.length && (
              <p className="muted small">
                As próximas alterações serão registradas aqui.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
