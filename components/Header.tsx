"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HeartPulse,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Bookmark,
} from "lucide-react";
import { signOut } from "@/app/actions";
import type { User } from "@/lib/types";
export default function Header({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    ["/", "Início"],
    ["/pops", "POPs"],
    ["/categorias", "Categorias"],
    ["/sobre", "Sobre o Projeto"],
    ["/contato", "Contato"],
  ];
  return (
    <>
      <div className="institution">
        <span>
          <span className="status-dot" /> Policlínica 24h / UPA · Nova Santa
          Rita – RS
        </span>
        <span>
          <ShieldCheck size={13} /> Acesso institucional
        </span>
      </div>
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-icon">
              <HeartPulse size={27} />
            </span>
            <span>
              <strong>
                POPs <b>UPA</b>
              </strong>
              <small>Conhecimento na Palma da Mão</small>
            </span>
          </Link>
          <button
            className="mobile-toggle icon-button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            className={open ? "nav open" : "nav"}
            aria-label="Menu principal"
          >
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  (href === "/" ? pathname === "/" : pathname.startsWith(href))
                    ? "active"
                    : ""
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/favoritos"
              aria-label="Meus favoritos"
              onClick={() => setOpen(false)}
            >
              <Bookmark size={19} />
              <span className="mobile-label">Favoritos</span>
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="admin-link"
                onClick={() => setOpen(false)}
              >
                Painel admin
              </Link>
            )}
            <form action={signOut}>
              <button
                className="icon-button"
                title="Sair"
                aria-label="Sair da conta"
              >
                <LogOut size={18} />
              </button>
            </form>
          </nav>
        </div>
      </header>
    </>
  );
}
