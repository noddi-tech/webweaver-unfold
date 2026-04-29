import * as Icons from "lucide-react";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { BadgeItem, BadgesConfig, SlideVisualProps } from "../types";

type IconComponent = React.ComponentType<{ className?: string }>;

function getIcon(name: string): IconComponent {
  const icons: Record<string, unknown> = Icons;
  const candidate = icons[name];
  return typeof candidate === "function" ? (candidate as IconComponent) : Icons.Sparkles;
}

function BadgeCard({ badge }: { badge: BadgeItem }) {
  const Icon = getIcon(badge.icon);
  return (
    <article className="rounded-xl bg-card-surface p-5">
      <Icon className="mb-4 h-8 w-8 text-primary" />
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Problem</p>
      <p className="mb-4 text-sm leading-relaxed text-foreground">{badge.problem}</p>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Solution</p>
      <p className="text-sm leading-relaxed text-foreground">{badge.solution}</p>
    </article>
  );
}

export function BadgesVisual({ slide, config }: SlideVisualProps<BadgesConfig>) {
  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {config?.badges?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {config.badges.slice(0, 5).map((badge, index) => <BadgeCard key={`${badge.problem}-${index}`} badge={badge} />)}
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
