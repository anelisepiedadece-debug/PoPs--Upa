import { requireUser } from "@/lib/auth";
import { categories } from "@/lib/types";
import { listPops } from "@/lib/db";
import CategoryCard from "@/components/CategoryCard";
import { QRCodeButton } from "@/components/Actions";
export default async function CategoriesPage() {
  await requireUser();
  const pops = listPops();
  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ENCONTRE POR ÁREA</span>
          <h1>Categorias</h1>
          <p>Procedimentos organizados por setor e área de cuidado.</p>
        </div>
        <QRCodeButton />
      </div>
      <div className="category-grid">
        {categories.map((c) => (
          <CategoryCard
            key={c.slug}
            category={c}
            count={pops.filter((p) => p.category === c.slug).length}
          />
        ))}
      </div>
    </div>
  );
}
