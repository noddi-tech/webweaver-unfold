import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { GlideConfig, SlideVisualProps } from "../types";

interface ProjectionRow {
  id: string;
  period_label: string;
  period_date: string;
  arr_nok: number;
  is_actual: boolean;
  display_order: number;
}

const formatNokM = (value: number) => `NOK ${(Number(value) / 1_000_000).toFixed(1)} M`;

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

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {projections.length ? (
        <div className="h-[280px] min-h-[240px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 10, right: 24, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="glideFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="period_label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatNokM(Number(value))} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={88} />
              <Tooltip formatter={(value, _name, entry) => [formatNokM(Number(value)), entry.payload.is_actual ? "Actual ARR" : "Projected ARR"]} contentStyle={{ background: "hsl(var(--card-background))", border: "1px solid hsl(var(--border))" }} />
              {config?.break_even_nok ? <ReferenceLine y={config.break_even_nok} stroke="hsl(var(--secondary))" strokeDasharray="4 4" label="Break-even" /> : null}
              <Area type="monotone" dataKey="arr_nok" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#glideFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
