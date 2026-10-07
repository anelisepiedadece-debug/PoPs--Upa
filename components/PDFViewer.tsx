"use client";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";
function DocumentReader({ url, title }: { url: string; title: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | undefined;
    const controller = new AbortController();
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const response = await fetch(url, {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error("O documento não está disponível para esta conta.");
        const bytes = new Uint8Array(await response.arrayBuffer());
        task = pdfjs.getDocument({
          data: bytes,
          cMapUrl: "/pdf-assets/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "/pdf-assets/standard_fonts/",
          wasmUrl: "/pdf-assets/wasm/",
          iccUrl: "/pdf-assets/iccs/",
        });
        const document = await task.promise;
        if (cancelled) {
          await task.destroy();
          return;
        }
        setDoc(document);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Não foi possível abrir o PDF.",
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      void task?.destroy().catch(() => {});
    };
  }, [url]);
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    let renderTask:
      | ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]>
      | undefined;
    setLoading(true);
    setText("");
    setError("");
    (async () => {
      try {
        const pdfPage = await doc.getPage(page);
        if (cancelled || !canvas.current) return;
        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const target = canvas.current;
        const context = target.getContext("2d");
        if (!context)
          throw new Error(
            "Seu navegador não suporta este leitor. Use Abrir documento completo.",
          );
        target.width = viewport.width;
        target.height = viewport.height;
        renderTask = pdfPage.render({
          canvas: target,
          canvasContext: context,
          viewport,
        });
        await renderTask.promise;
        const content = await pdfPage.getTextContent();
        if (cancelled) return;
        setText(
          content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" "),
        );
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Não foi possível renderizar a página.",
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, page]);
  return (
    <div className="document-reader">
      <div className="pdf-toolbar">
        <button
          className="icon-button"
          aria-label="Página anterior"
          disabled={!doc || page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft size={20} />
        </button>
        <span>
          Página {page} de {doc?.numPages ?? "…"}
        </span>
        <button
          className="icon-button"
          aria-label="Próxima página"
          disabled={!doc || page >= doc.numPages || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {loading && (
        <p className="pdf-loading" role="status">
          <LoaderCircle className="spin" size={18} />
          Carregando documento…
        </p>
      )}
      {error && (
        <p className="form-message error" role="alert">
          {error} Você também pode baixar o PDF ou abrir o documento completo.
        </p>
      )}
      <div className="pdf-canvas-wrap" aria-busy={loading}>
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${title}, página ${page}`}
        />
      </div>
      {doc && !loading && !error && (
        <>
          <p className="muted small" role="status">
            Página {page} de {doc.numPages} carregada.
          </p>
          <details className="pdf-extracted-text">
            <summary>Texto desta página</summary>
            <p className="pdf-text">
              {text ||
                "Esta página contém imagens ou texto digitalizado. Consulte o documento original."}
            </p>
          </details>
        </>
      )}
    </div>
  );
}
export default function PDFViewer({
  id,
  title,
}: {
  id: string | null;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  if (!id)
    return (
      <div className="pdf-missing">
        <FileText size={24} />
        <div>
          <strong>PDF ainda não disponibilizado</strong>
          <p>
            A administradora pode anexar o documento institucional no painel.
          </p>
        </div>
      </div>
    );
  const url = "/api/documents/" + id;
  return (
    <section className="pdf-viewer">
      <div className="button-row">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="button primary"
        >
          <FileText size={18} />
          {open ? "Fechar PDF" : "Visualizar PDF"}
          <ChevronDown size={16} />
        </button>
        <a className="button secondary" href={url + "?download=1"}>
          <Download size={18} />
          Baixar PDF
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="button secondary"
        >
          <ExternalLink size={18} />
          Abrir documento completo
        </a>
      </div>
      {open && <DocumentReader key={id} url={url} title={title} />}
    </section>
  );
}
