"use client";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, FileSearch, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { categories, matches, type Pop } from "@/lib/types";
import PopCard from "./PopCard";
import { readFavorites } from "./Actions";
export default function PopList({
  pops,
  userId,
  category = "",
  favorites = false,
}: {
  pops: Pop[];
  userId: string;
  category?: string;
  favorites?: boolean;
}) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [selected, setSelected] = useState(category);
  const [sort, setSort] = useState("title");
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(!favorites);
  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);
  useEffect(() => {
    const sync = () => {
      setIds(readFavorites(userId));
      setReady(true);
    };
    sync();
    window.addEventListener("favorites-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favorites-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);
  const results = pops
    .filter(
      (p) =>
        (!favorites || ids.includes(p.id)) &&
        (!selected || p.category === selected) &&
        matches(p, query),
    )
    .sort((a, b) =>
      sort === "recent"
        ? b.updatedAt.localeCompare(a.updatedAt)
        : sort === "views"
          ? b.views - a.views
          : a.title.localeCompare(b.title, "pt-BR"),
    );
  return (
    <>
      <div className="filter-panel">
        <div className="search-input">
          <Search size={21} />
          <input
            aria-label="Pesquisar POPs"
            placeholder="Digite o nome, código ou palavra-chave…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Limpar pesquisa"
              onClick={() => setQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="filter-select">
          <SlidersHorizontal size={18} />
          <select
            aria-label="Filtrar por categoria"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <select
          aria-label="Ordenar POPs"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="title">Nome: A–Z</option>
          <option value="recent">Mais recentes</option>
          <option value="views">Mais acessados</option>
        </select>
      </div>
      <div className="results-line" role="status" aria-live="polite">
        {ready
          ? `${results.length} ${results.length === 1 ? "documento encontrado" : "documentos encontrados"}`
          : "Carregando favoritos…"}
        <span>Organizados para facilitar sua rotina</span>
      </div>
      {ready && results.length > 0 ? (
        <div className="pop-grid">
          {results.map((p) => (
            <PopCard key={p.id} pop={p} userId={userId} />
          ))}
        </div>
      ) : ready ? (
        <div className="empty-state">
          <FileSearch size={42} />
          <h2>
            {favorites
              ? "Seu acervo favorito começa aqui"
              : "Nenhum POP encontrado"}
          </h2>
          <p>
            {favorites
              ? "Toque na estrela de um POP para encontrá-lo rapidamente nesta página."
              : "Tente outro termo ou categoria. Novos documentos aparecerão após o cadastro pela administradora."}
          </p>
        </div>
      ) : null}
    </>
  );
}
