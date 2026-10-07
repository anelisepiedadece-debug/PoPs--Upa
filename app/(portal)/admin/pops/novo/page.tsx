import AdminHeader from "@/components/AdminHeader";
import { PopForm } from "@/components/Forms";
export default function NewPopPage() {
  return (
    <>
      <AdminHeader
        title="Cadastrar POP"
        description="Adicione um novo documento ao acervo institucional."
      />
      <PopForm />
    </>
  );
}
