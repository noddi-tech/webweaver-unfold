import { ComparisonTable, type ComparisonColumn, type ComparisonRow } from "../components";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { GapConfig, SlideVisualProps } from "../types";

export function GapVisual({ slide, config }: SlideVisualProps<GapConfig>) {
  const columns: ComparisonColumn[] = [
    { key: "left", label: config?.leftLabel ?? "Markedet i dag" },
    { key: "right", label: config?.rightLabel ?? deckText.navio },
  ];
  const rows: ComparisonRow[] = config?.rows?.length
    ? config.rows.map((row) => ({ label: row.category, values: { left: row.leftValue, right: row.rightValue }, emphasisKey: "right" }))
    : (config?.categories ?? []).map((category) => ({ label: category.label, values: { left: category.competitors.map((competitor) => competitor.name).join(" · ") || deckText.noData, right: `${deckText.navio}: ${category.navio_position}%` }, emphasisKey: "right" }));

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      {rows.length ? <ComparisonTable title={config?.title ?? slide.title ?? deckText.comparison} columns={columns} rows={rows} /> : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
