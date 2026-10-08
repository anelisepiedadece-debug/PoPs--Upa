import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { listPops } from "@/lib/db";
import PopList from "@/components/PopList";
export default async function PopsPage() {
  const user = await requireUser();
  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACERVO INSTITUCIONAL</span>
          <h1>Todos os POPs</h1>
          <p>Encontre o procedimento que você precisa para sua rotina.</p>
        </div>
      </div>
      <Suspense fallback={<p>Carregando acervo…</p>}>
        <PopList pops={await listPops()} userId={user.id} />
      </Suspense>
    </div>
  );
}
