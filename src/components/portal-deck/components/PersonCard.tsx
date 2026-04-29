import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, Person } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, initials, labelTextStyle, safeTextStyle } from "./utils";

export interface PersonCardProps extends DeckComponentProps {
  person: Person;
}

export function PersonCard({ person, density = "sparse", accent = "primary", className }: PersonCardProps) {
  return (
    <article className={cn("min-w-0 rounded-md border border-border bg-card-background p-6", density === "dense" ? "grid gap-5 lg:grid-cols-[96px_minmax(0,1fr)]" : "space-y-6", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card-surface text-2xl font-semibold text-card-surface-foreground">
        {person.imageUrl ? <img src={person.imageUrl} alt={person.name} className="h-full w-full object-cover" loading="lazy" /> : initials(person.name)}
      </div>
      <div className="min-w-0">
        <p className={type.micro} style={labelTextStyle}>{person.role}</p>
        <h3 className="mt-2 text-2xl font-semibold text-foreground" style={balancedTextStyle}>{person.name}</h3>
        <p className="mt-4 text-sm text-muted-foreground" style={bodyTextStyle}>{person.bio}</p>
        {person.metric ? <p className="mt-5 rounded-sm border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground" style={safeTextStyle}>{person.metric}</p> : null}
      </div>
    </article>
  );
}
