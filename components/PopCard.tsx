import Link from "next/link";
import { ArrowUpRight, FileText, CalendarDays } from "lucide-react";
import { categoryName, dateLabel, type Pop } from "@/lib/types";
import { FavoriteButton } from "./Actions";
export default function PopCard({
  pop,
  userId,
  compact = false,
}: {
  pop: Pop;
  userId: string;
  compact?: boolean;
}) {
  return (
    <article className={compact ? "pop-card compact" : "pop-card"}>
      <div className="card-top">
        <span className="document-icon">
          <FileText size={23} />
        </span>
        <FavoriteButton id={pop.id} userId={userId} />
      </div>
      <div className="tag-row">
        <span className="tag">{categoryName(pop.category)}</span>
        {pop.demo && <span className="demo-tag">Demonstração</span>}
        {pop.status === "inactive" && <span className="demo-tag">Inativo</span>}
      </div>
      <Link className="pop-title" href={"/pops/" + pop.id}>
        {pop.title}
      </Link>
      <span className="pop-code">
        {pop.code} <span>·</span> Versão {pop.version}
      </span>
      {!compact && <p>{pop.description}</p>}
      <div className="card-bottom">
        <span>
          <CalendarDays size={13} />
          {dateLabel(pop.updatedAt)}
        </span>
        <Link href={"/pops/" + pop.id}>
          Visualizar POP <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
