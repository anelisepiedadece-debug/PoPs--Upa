import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { listPops } from "@/lib/db";
import PopList from "@/components/PopList";
export default async function FavoritesPage() {
  const user = await requireUser();
  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEU ACESSO RÁPIDO</span>
          <h1>Meus Favoritos</h1>
          <p>Seus documentos salvos neste navegador, separados por conta.</p>
        </div>
      </div>
      <Suspense fallback={<p>Carregando favoritos…</p>}>
        <PopList pops={await listPops()} userId={user.id} favorites />
      </Suspense>
    </div>
  );
}
