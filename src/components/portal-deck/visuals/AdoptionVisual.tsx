import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnnotatedChart, type ChartPoint } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { AdoptionConfig, SlideVisualProps } from "../types";

interface AdoptionPointRow {
  id: string;
  customer_id: string;
  date: string;
  cities_live: number;
  pct_addressable: number | null;
  note: string | null;
}

export function AdoptionVisual({ slide, config }: SlideVisualProps<AdoptionConfig>) {
  const { data: points = [] } = useQuery({
    queryKey: ["portal-adoption-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_adoption_points")
        .select("id,customer_id,date,cities_live,pct_addressable,note")
        .order("date", { ascending: true });
      if (error) throw error;
      return data as AdoptionPointRow[];
    },
  });

  const chartPoints = useMemo<ChartPoint[]>(() => points.map((point) => ({
    label: new Intl.DateTimeFormat("nb-NO", { month: "short", year: "2-digit" }).format(new Date(`${point.date}T00:00:00`)),
    value: Number(point.pct_addressable ?? point.cities_live ?? 0),
  })), [points]);

  return (
    <section className="h-full overflow-hidden p-6 sm:p-10">
      {chartPoints.length ? (
        <AnnotatedChart title={config?.headline ?? slide.title ?? undefined} valueLabel={deckText.addressablePercent} points={chartPoints} annotations={config?.annotations ?? []} />
      ) : <p className="text-center text-sm text-muted-foreground">{deckText.adoptionPlaceholder}</p>}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
