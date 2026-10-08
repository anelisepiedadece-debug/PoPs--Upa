import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getPop } from "@/lib/db";
import AdminHeader from "@/components/AdminHeader";
import { PopForm } from "@/components/Forms";
export default async function EditPopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const pop = await getPop(id);
  if (!pop) notFound();
  return (
    <>
      <AdminHeader
        title="Editar POP"
        description="Cada alteração preserva a versão anterior no histórico."
      />
      <PopForm pop={pop} />
    </>
  );
}
