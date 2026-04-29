import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, Person } from "./types";
import { accentStyle, initials } from "./utils";

export interface PersonCardProps extends DeckComponentProps {
  person: Person;
}

export function PersonCard({ person, density = "sparse", accent = "primary", className }: PersonCardProps) {
  return (
    <article className={cn("rounded-md border border-border bg-card-background p-6", density === "dense" ? "grid gap-5 md:grid-cols-[96px_1fr]" : "space-y-6", className)} style={accentStyle(accent)}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-card-surface text-2xl font-semibold text-card-surface-foreground">
        {person.imageUrl ? <img src={person.imageUrl} alt={person.name} className="h-full w-full object-cover" loading="lazy" /> : initials(person.name)}
      </div>
      <div>
        <p className={type.micro}>{person.role}</p>
        <h3 className="mt-2 text-2xl font-semibold text-foreground">{person.name}</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
        {person.metric ? <p className="mt-5 border-t border-border pt-4 text-sm font-semibold text-foreground">{person.metric}</p> : null}
      </div>
    </article>
  );
}
