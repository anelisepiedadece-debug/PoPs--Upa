import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "./Icons";
import type { categories } from "@/lib/types";
export default function CategoryCard({
  category,
  count,
}: {
  category: (typeof categories)[number];
  count: number;
}) {
  return (
    <Link className="category-card" href={"/categorias/" + category.slug}>
      <span className={"category-icon " + category.color}>
        <CategoryIcon name={category.icon} />
      </span>
      <div>
        <strong>{category.name}</strong>
        <small>
          {count} {count === 1 ? "POP disponível" : "POPs disponíveis"}
        </small>
      </div>
      <ArrowUpRight size={17} className="category-arrow" />
    </Link>
  );
}
