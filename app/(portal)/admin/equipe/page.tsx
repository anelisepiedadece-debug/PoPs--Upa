import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { toggleMemberAction } from "@/app/actions";
import AdminHeader from "@/components/AdminHeader";
import { MemberForm, PasswordForm } from "@/components/Forms";
export default async function TeamPage() {
  await requireAdmin();
  const users = listUsers();
  return (
    <>
      <AdminHeader
        title="Acesso da equipe"
        description="Você controla quem pode consultar os POPs. Integrantes não podem editar."
      />
      <div className="team-layout">
        <section className="panel">
          <h2>Cadastrar integrante</h2>
          <MemberForm />
        </section>
        <section className="panel">
          <h2>Contas cadastradas</h2>
          <div className="team-list">
            {users.map((u) => (
              <article className="team-member" key={u.id}>
                <div className="member-avatar">
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                  <span className="tag">
                    {u.role === "admin"
                      ? "Administradora"
                      : u.active
                        ? "Consulta autorizada"
                        : "Acesso suspenso"}
                  </span>
                  {u.role === "member" && (
                    <>
                      <form action={toggleMemberAction}>
                        <input name="id" type="hidden" value={u.id} />
                        <button className="button secondary small-button">
                          {u.active ? "Suspender acesso" : "Reativar acesso"}
                        </button>
                      </form>
                      <PasswordForm id={u.id} />
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
