export const categories = [
  { slug: "enfermagem", name: "Enfermagem", icon: "HeartPulse", color: "blue" },
  { slug: "medicacao", name: "Medicação", icon: "Pill", color: "purple" },
  {
    slug: "seguranca-do-paciente",
    name: "Segurança do Paciente",
    icon: "ShieldCheck",
    color: "green",
  },
  {
    slug: "urgencia-e-emergencia",
    name: "Urgência e Emergência",
    icon: "Siren",
    color: "orange",
  },
  {
    slug: "controle-de-infeccao",
    name: "Controle de Infecção",
    icon: "ShieldPlus",
    color: "teal",
  },
  {
    slug: "higienizacao",
    name: "Higienização",
    icon: "Sparkles",
    color: "blue",
  },
  {
    slug: "procedimentos",
    name: "Procedimentos",
    icon: "ClipboardPlus",
    color: "purple",
  },
  {
    slug: "equipamentos",
    name: "Equipamentos",
    icon: "Stethoscope",
    color: "green",
  },
  {
    slug: "administrativo",
    name: "Administrativo",
    icon: "Files",
    color: "orange",
  },
  { slug: "outros", name: "Outros", icon: "FolderOpen", color: "teal" },
] as const;
export const sections = [
  "Objetivo",
  "Campo de aplicação",
  "Responsáveis",
  "Materiais necessários",
  "Descrição do procedimento",
  "Cuidados",
  "Observações",
  "Referências",
] as const;
export interface Pop {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  keywords: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  approvedBy: string;
  pdfId: string | null;
  status: "active" | "inactive";
  views: number;
  isFeatured: boolean;
  demo: boolean;
  content: Record<string, string>;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  active: number;
}
export interface Version {
  id: string;
  popId: string;
  version: string;
  date: string;
  snapshot: Pop;
}
export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;
export const dateLabel = (date: string) =>
  new Date(date.slice(0, 10) + "T12:00:00Z").toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function matches(pop: Pop, query: string) {
  return normalize(
    [
      pop.title,
      pop.code,
      categoryName(pop.category),
      pop.description,
      pop.keywords,
    ].join(" "),
  ).includes(normalize(query.trim()));
}
