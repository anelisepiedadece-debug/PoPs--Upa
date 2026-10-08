// Server-side only: never prefix these variables with NEXT_PUBLIC_.
export function cloudEnabled() {
  const backend = process.env.POPS_BACKEND || "local";
  if (backend !== "local" && backend !== "supabase")
    throw new Error("POPS_BACKEND deve ser local ou supabase.");
  return backend === "supabase";
}
export function cloudConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Configure o Supabase no ambiente privado da hospedagem.");
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".supabase.co") ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/"
  )
    throw new Error("Informe a URL HTTPS do projeto Supabase.");
  return { url: parsed.origin, key };
}
export async function cloudRequest(endpoint: string, init: RequestInit = {}) {
  const { url, key } = cloudConfig();
  const response = await fetch(url + endpoint, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    // Never surface provider response bodies (which may contain sensitive data).
    if (response.status === 409)
      throw new Error("Já existe um cadastro com este código ou usuário.");
    throw new Error(
      "O armazenamento está indisponível. Verifique a configuração e os limites do plano gratuito.",
    );
  }
  return response;
}
export async function rpc<T>(
  operation: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const response = await cloudRequest("/rest/v1/rpc/pops_upa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, args }),
  });
  return response.json();
}
