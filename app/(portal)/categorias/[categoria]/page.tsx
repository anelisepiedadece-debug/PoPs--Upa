import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { categories } from "@/lib/types";
import { listPops } from "@/lib/db";
import PopList from "@/components/PopList";
import { QRCodeButton } from "@/components/Actions";
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = categories.find((c) => c.slug === categoria);
  if (!category) notFound();
  const user = await requireUser();
  return (
    <div className="container page">
      <Link className="back-link" href="/categorias">
        ← Todas as categorias
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">POPs POR CATEGORIA</span>
          <h1>{category.name}</h1>
          <p>Consulte os documentos disponíveis nesta área.</p>
        </div>
        <QRCodeButton />
      </div>
      <Suspense fallback={<p>Carregando documentos…</p>}>
        <PopList
          pops={await listPops()}
          userId={user.id}
          category={categoria}
        />
      </Suspense>
    </div>
  );
}
