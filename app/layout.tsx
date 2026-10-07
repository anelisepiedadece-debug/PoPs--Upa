import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "POPs UPA · Conhecimento na Palma da Mão",
    template: "%s · POPs UPA",
  },
  description:
    "Acervo institucional de Procedimentos Operacionais Padrão da Policlínica 24h / UPA de Nova Santa Rita – RS.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#main">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
