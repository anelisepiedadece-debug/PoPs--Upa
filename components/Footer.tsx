import { HeartPulse, ShieldCheck } from "lucide-react";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Link href="/" className="brand">
            <span className="brand-icon">
              <HeartPulse size={25} />
            </span>
            <span>
              <strong>POPs UPA</strong>
              <small>Conhecimento na Palma da Mão</small>
            </span>
          </Link>
          <p>Informação acessível para uma assistência mais segura.</p>
          <p>Policlínica 24h / UPA · Nova Santa Rita – RS</p>
        </div>
        <div>
          <strong>Um projeto para cuidar melhor.</strong>
          <p>Desenvolvido por: Anelise Piedade</p>
          <p>Aprovado por: Lilian Silva – Diretora Geral</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} POPs UPA · Uso institucional.</span>
        <span>
          <ShieldCheck size={15} /> Acesso exclusivo para a equipe
        </span>
      </div>
    </footer>
  );
}
