import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Pencil, ExternalLink } from "lucide-react";
import { listPops } from "@/lib/db";
import { categoryName, dateLabel } from "@/lib/types";
import AdminHeader from "@/components/AdminHeader";
import { DeletePopButton } from "@/components/Forms";
export default async function AdminPopsPage() {
  await requireAdmin();
  return (
    <>
      <AdminHeader
        title="Gerenciar POPs"
        description="Cadastre, atualize e organize os procedimentos da unidade."
        add
      />
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Categoria</th>
              <th>Atualização</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(await listPops(true)).map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.title}</strong>
                  <small>
                    {p.code} · v{p.version}
                    {p.demo ? " · Demonstração" : ""}
                  </small>
                </td>
                <td>{categoryName(p.category)}</td>
                <td>{dateLabel(p.updatedAt)}</td>
                <td>
                  <span className={p.status === "active" ? "tag" : "demo-tag"}>
                    {p.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link
                      className="icon-button"
                      href={"/pops/" + p.id}
                      aria-label={"Visualizar " + p.title}
                    >
                      <ExternalLink size={17} />
                    </Link>
                    <Link
                      className="icon-button"
                      href={"/admin/pops/" + p.id + "/editar"}
                      aria-label={"Editar " + p.title}
                    >
                      <Pencil size={17} />
                    </Link>
                    <DeletePopButton id={p.id} title={p.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!(await listPops(true)).length && <p>Nenhum POP cadastrado.</p>}
      </div>
    </>
  );
}
