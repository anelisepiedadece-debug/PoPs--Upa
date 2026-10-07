"use client";
import { useActionState, useState } from "react";
import {
  LoaderCircle,
  LogIn,
  Plus,
  Trash2,
  Save,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  signIn,
  firstAccessAction,
  createMemberAction,
  removePopAction,
  resetPasswordAction,
  savePopAction,
  type FormState,
} from "@/app/actions";
import { categories, sections, type Pop } from "@/lib/types";
const initial: FormState = {};
function Feedback({ state }: { state: FormState }) {
  return (
    <>
      {state.error && (
        <p className="form-message error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-message success" role="status">
          {state.success}
        </p>
      )}
    </>
  );
}
export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <form action={action} className="form-stack">
      <label>
        Usuário ou e-mail
        <input
          name="email"
          type="text"
          autoComplete="username"
          placeholder="anelisepiedade ou seu e-mail"
          required
          maxLength={254}
        />
      </label>
      <label>
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          required
          maxLength={128}
        />
      </label>
      <Feedback state={state} />
      <button className="button primary full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="spin" size={19} />
        ) : (
          <LogIn size={19} />
        )}{" "}
        {pending ? "Entrando…" : "Entrar no acervo"}
      </button>
      <p className="muted small">
        Precisa de acesso ou esqueceu sua senha? Solicite à administradora da
        unidade.
      </p>
    </form>
  );
}
export function MemberForm() {
  const [state, action, pending] = useActionState(createMemberAction, initial);
  return (
    <form action={action} className="form-stack">
      <label>
        Nome completo
        <input name="name" required minLength={2} maxLength={180} />
      </label>
      <label>
        E-mail
        <input name="email" type="email" required maxLength={254} />
      </label>
      <label>
        Senha inicial
        <input
          name="password"
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
        />
        <small>
          De 12 a 128 caracteres. Compartilhe somente com este integrante.
        </small>
      </label>
      <Feedback state={state} />
      <button className="button primary" disabled={pending}>
        <Plus size={18} />
        {pending ? "Cadastrando…" : "Cadastrar integrante"}
      </button>
    </form>
  );
}
export function PasswordForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <details className="reset-password">
      <summary>Redefinir senha</summary>
      <form action={action} className="form-stack">
        <input type="hidden" name="id" value={id} />
        <label>
          Nova senha
          <input
            name="password"
            type="password"
            minLength={12}
            maxLength={128}
            required
            autoComplete="new-password"
          />
        </label>
        <Feedback state={state} />
        <button className="button secondary" disabled={pending}>
          <LockKeyhole size={16} />
          Salvar senha
        </button>
      </form>
    </details>
  );
}
export function DeletePopButton({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState(removePopAction, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `Excluir “${title}”? O documento será removido do acervo e seu histórico será excluído.`,
          )
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        className="icon-button danger"
        aria-label={"Excluir " + title}
        disabled={pending}
      >
        <Trash2 size={17} />
      </button>
      <Feedback state={state} />
    </form>
  );
}
export function PopForm({ pop }: { pop?: Pop }) {
  const [state, action, pending] = useActionState(savePopAction, initial);
  const [fileError, setFileError] = useState("");
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  return (
    <form action={action} className="pop-form">
      <input type="hidden" name="id" value={pop?.id || ""} />
      <section className="panel">
        <div className="panel-heading">
          <span className="step">01</span>
          <div>
            <h2>Identificação do documento</h2>
            <p>As informações que a equipe verá no acervo.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="span-2">
            Nome do POP
            <input
              name="title"
              defaultValue={pop?.title}
              required
              minLength={3}
              maxLength={180}
              placeholder="Ex.: Higienização das mãos"
            />
          </label>
          <label>
            Código
            <input
              name="code"
              defaultValue={pop?.code}
              required
              minLength={2}
              maxLength={50}
              placeholder="POP-ENF-001"
            />
          </label>
          <label>
            Categoria
            <select
              name="category"
              defaultValue={pop?.category || "enfermagem"}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Breve descrição
            <textarea
              name="description"
              defaultValue={pop?.description}
              required
              minLength={5}
              maxLength={1500}
              rows={3}
            />
          </label>
          <label className="span-2">
            Palavras-chave
            <input
              name="keywords"
              defaultValue={pop?.keywords}
              maxLength={500}
              placeholder="Separe palavras ou expressões com vírgulas"
            />
          </label>
          <label>
            Versão
            <input
              name="version"
              defaultValue={pop?.version || "1.0"}
              required
              maxLength={30}
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={pop?.status || "active"}>
              <option value="active">Ativo — disponível para a equipe</option>
              <option value="inactive">Inativo — somente administradora</option>
            </select>
          </label>
          <label>
            Data de criação
            <input
              type="date"
              name="createdAt"
              defaultValue={pop?.createdAt || today}
              required
            />
          </label>
          <label>
            Última atualização
            <input
              type="date"
              name="updatedAt"
              defaultValue={pop?.updatedAt || today}
              required
            />
          </label>
          <label>
            Elaborado por
            <input
              name="author"
              defaultValue={pop?.author || "Anelise Piedade"}
              required
              minLength={2}
              maxLength={180}
            />
          </label>
          <label>
            Aprovado por
            <input
              name="approvedBy"
              defaultValue={pop?.approvedBy || ""}
              required
              minLength={2}
              maxLength={180}
            />
          </label>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <span className="step">02</span>
          <div>
            <h2>Arquivo PDF</h2>
            <p>Envie a versão institucional aprovada. Máximo de 15 MB.</p>
          </div>
        </div>
        {pop?.pdfId && (
          <p className="success">
            Há um PDF anexado. Envie outro somente para substituí-lo; a versão
            anterior será preservada no histórico.
          </p>
        )}
        <label className="upload-zone">
          Selecionar documento PDF
          <input
            type="file"
            name="pdf"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 15 * 1024 * 1024) {
                setFileError("O PDF deve ter no máximo 15 MB.");
                e.target.value = "";
              } else setFileError("");
            }}
          />
        </label>
        {fileError && (
          <p className="error" role="alert">
            {fileError}
          </p>
        )}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <span className="step">03</span>
          <div>
            <h2>Conteúdo de consulta</h2>
            <p>
              Opcional. Transcreva somente informações do documento aprovado.
            </p>
          </div>
        </div>
        <div className="form-grid">
          {sections.map((s) => (
            <label className="span-2" key={s}>
              {s}
              <textarea
                name={s}
                rows={3}
                maxLength={20000}
                defaultValue={pop?.content[s] || ""}
              />
            </label>
          ))}
        </div>
      </section>
      <section className="panel">
        <label className="check-label">
          <input
            type="checkbox"
            name="demo"
            defaultChecked={pop?.demo || false}
          />
          Marcar como documento demonstrativo
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={pop?.isFeatured || false}
          />
          Destacar na página inicial
        </label>
        <Feedback state={state} />
        <div className="button-row">
          <button className="button primary" disabled={pending || !!fileError}>
            <Save size={18} />
            {pending ? "Salvando…" : "Salvar POP"}
          </button>
          <a className="button secondary" href="/admin/pops">
            Cancelar
          </a>
        </div>
      </section>
    </form>
  );
}

export function FirstAccessForm() {
  const [state, action, pending] = useActionState(firstAccessAction, initial);
  return (
    <form action={action} className="form-stack">
      <label>
        Usuário da administradora
        <input value="anelisepiedade" readOnly autoComplete="username" />
      </label>
      <label>
        Código de ativação
        <input
          name="activationCode"
          type="password"
          minLength={32}
          maxLength={256}
          required
          autoComplete="off"
        />
        <small>Use o código privado fornecido na implantação do site.</small>
      </label>
      <label>
        Crie sua senha
        <input
          name="password"
          type="password"
          minLength={12}
          maxLength={128}
          required
          autoComplete="new-password"
        />
        <small>
          Escolha de 12 a 128 caracteres. Não compartilhe sua senha.
        </small>
      </label>
      <label>
        Confirme sua senha
        <input
          name="confirmation"
          type="password"
          minLength={12}
          maxLength={128}
          required
          autoComplete="new-password"
        />
      </label>
      <Feedback state={state} />
      <button className="button primary full" disabled={pending}>
        <ShieldCheck size={18} />
        {pending ? "Ativando…" : "Ativar minha conta"}
      </button>
    </form>
  );
}
