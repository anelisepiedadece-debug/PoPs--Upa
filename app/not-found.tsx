import Link from "next/link";
import { FileSearch } from "lucide-react";
export default function NotFound() {
  return (
    <main id="main" className="container page empty-state">
      <FileSearch size={44} />
      <h1>Página não encontrada</h1>
      <p>Este documento pode ter sido removido ou estar indisponível.</p>
      <Link className="button primary" href="/pops">
        Voltar aos POPs
      </Link>
    </main>
  );
}
