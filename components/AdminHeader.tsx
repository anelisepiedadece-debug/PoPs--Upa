import Link from "next/link";
import { Plus } from "lucide-react";
export default function AdminHeader({
  title,
  description,
  add = false,
}: {
  title: string;
  description: string;
  add?: boolean;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">PAINEL DA ADMINISTRADORA</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {add && (
        <Link className="button primary" href="/admin/pops/novo">
          <Plus size={18} />
          Cadastrar POP
        </Link>
      )}
    </div>
  );
}
