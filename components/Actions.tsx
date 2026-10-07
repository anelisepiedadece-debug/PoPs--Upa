"use client";
import { useEffect, useRef, useState } from "react";
import { Star, Share2, QrCode, X, Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
export function favoriteKey(userId: string) {
  return "pops-favorites:" + userId;
}
export function readFavorites(userId: string): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(favoriteKey(userId)) || "[]");
    return Array.isArray(data) ? data.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
export function FavoriteButton({
  id,
  userId,
  label = false,
}: {
  id: string;
  userId: string;
  label?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const sync = () => setActive(readFavorites(userId).includes(id));
    sync();
    window.addEventListener("favorites-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favorites-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id, userId]);
  function toggle() {
    const all = readFavorites(userId);
    try {
      localStorage.setItem(
        favoriteKey(userId),
        JSON.stringify(active ? all.filter((v) => v !== id) : [...all, id]),
      );
      setActive(!active);
      window.dispatchEvent(new Event("favorites-change"));
    } catch {
      setError("Seu navegador não permitiu salvar os favoritos.");
    }
  }
  return (
    <>
      <button
        onClick={toggle}
        className={label ? "button secondary" : "favorite icon-button"}
        aria-pressed={active}
        aria-label={
          active ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Star
          size={19}
          fill={active ? "currentColor" : "none"}
          className={active ? "starred" : ""}
        />
        {label && (active ? "Nos favoritos" : "Favoritar")}
      </button>
      {error && (
        <span role="status" className="error">
          {error}
        </span>
      )}
    </>
  );
}
export function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState("");
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        setStatus("Link copiado");
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setStatus("Use o endereço da página para compartilhar.");
    }
  }
  return (
    <>
      <button className="button secondary" onClick={share}>
        <Share2 size={18} />
        Compartilhar POP
      </button>
      {status && <span role="status">{status}</span>}
    </>
  );
}
export function QRCodeButton({ label = "Gerar QR Code" }: { label?: string }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  async function show() {
    try {
      setUrl(
        await QRCode.toDataURL(location.href, {
          width: 320,
          margin: 2,
          color: { dark: "#123c55", light: "#ffffff" },
        }),
      );
      setOpen(true);
    } catch {
      setError("Não foi possível gerar o QR Code.");
    }
  }
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const list =
          dialog.current?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      trigger.current?.focus();
    };
  }, [open]);
  return (
    <>
      <button ref={trigger} className="button secondary" onClick={show}>
        <QrCode size={18} />
        {label}
      </button>
      {error && <span role="status">{error}</span>}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <section
            ref={dialog}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              onClick={() => setOpen(false)}
              className="icon-button modal-close"
              aria-label="Fechar QR Code"
            >
              <X />
            </button>
            <h2 id="qr-title">Conhecimento ao alcance</h2>
            <p>
              Escaneie para abrir esta página. O acesso continua protegido por
              login.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              width={280}
              height={280}
              alt="QR Code da página atual"
            />
            <div className="button-row">
              <a
                className="button primary"
                href={url}
                download="pops-upa-qrcode.png"
              >
                <Download size={18} />
                Baixar QR Code
              </a>
              <button
                className="button secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(location.href);
                    setCopied(true);
                  } catch {
                    setError("Copie o endereço pela barra do navegador.");
                  }
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}Copiar link
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
export function ViewCounter({ id }: { id: string }) {
  useEffect(() => {
    const key = "pops-view:" + id;
    if (sessionStorage.getItem(key)) return;
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => {
        if (r.ok) sessionStorage.setItem(key, "1");
      })
      .catch(() => {});
  }, [id]);
  return null;
}
