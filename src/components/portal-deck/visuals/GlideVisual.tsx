import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnnotatedChart, type ChartAnnotation, type ChartPoint } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { GlideConfig, SlideVisualProps } from "../types";

interface ProjectionRow {
  id: string;
  period_label: string;
  period_date: string;
  arr_nok: number;
  is_actual: boolean;
  display_order: number;
}

export function GlideVisual({ slide, config }: SlideVisualProps<GlideConfig>) {
  const { data: projections = [] } = useQuery({
    queryKey: ["portal-financial-projections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_financial_projections")
        .select("id,period_label,period_date,arr_nok,is_actual,display_order")
        .order("period_date", { ascending: true });
      if (error) throw error;
      return data as ProjectionRow[];
    },
  });

  const points = useMemo<ChartPoint[]>(() => projections.map((projection) => ({ label: projection.period_label, value: Number(projection.arr_nok) / 1_000_000 })), [projections]);
  const annotations = useMemo<ChartAnnotation[]>(() => {
    if (config?.annotations?.length) return config.annotations;
    if (!config?.break_even_nok || !projections.length) return [];
    const closest = projections.reduce((best, projection) => Math.abs(projection.arr_nok - config.break_even_nok!) < Math.abs(best.arr_nok - config.break_even_nok!) ? projection : best, projections[0]);
    return [{ label: config.breakEvenLabel ?? deckText.breakEven, pointLabel: closest.period_label }];
  }, [config, projections]);

  return (
    <section className="h-full overflow-hidden p-6 sm:p-10">
      {points.length ? <AnnotatedChart title={config?.headline ?? slide.title ?? undefined} valueLabel={deckText.arrNokM} points={points} annotations={annotations} /> : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
