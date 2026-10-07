"use client";
import { Search, ArrowRight, FileText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { categoryName, matches, type Pop } from "@/lib/types";
export default function SearchBar({ pops }: { pops: Pop[] }) {
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? pops.filter((p) => matches(p, query)).slice(0, 5)
    : [];
  return (
    <div className="hero-search-wrap">
      <form action="/pops" className="hero-search">
        <Search size={23} />
        <input
          id="home-search"
          name="q"
          aria-label="Pesquisar POP"
          placeholder="Digite o nome do POP que deseja encontrar…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="button primary" aria-label="Buscar POPs">
          Buscar <ArrowRight size={17} />
        </button>
      </form>
      {query.trim() && (
        <div className="search-results" aria-live="polite">
          {results.map((p) => (
            <Link href={"/pops/" + p.id} key={p.id}>
              <FileText size={20} />
              <span>
                <strong>{p.title}</strong>
                <small>
                  {p.code} · {categoryName(p.category)}
                </small>
              </span>
              <ArrowRight size={17} />
            </Link>
          ))}
          {!results.length && (
            <p>Nenhum POP encontrado. Tente outra palavra-chave.</p>
          )}
          <Link
            className="all-results"
            href={"/pops?q=" + encodeURIComponent(query)}
          >
            Ver todos os resultados <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
