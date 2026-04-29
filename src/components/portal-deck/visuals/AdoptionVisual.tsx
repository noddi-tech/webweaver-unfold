import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { SlideVisualProps, VisualConfig } from "../types";

interface AdoptionPointRow {
  id: string;
  customer_id: string;
  date: string;
  cities_live: number;
  pct_addressable: number | null;
  note: string | null;
  portal_customers: { name: string } | null;
}

const palette = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--brand-orange))", "hsl(var(--brand-teal))", "hsl(var(--brand-green))"];

export function AdoptionVisual({ slide }: SlideVisualProps<VisualConfig>) {
  const { data: points = [] } = useQuery({
    queryKey: ["portal-adoption-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_adoption_points")
        .select("id,customer_id,date,cities_live,pct_addressable,note,portal_customers(name)")
        .order("date", { ascending: true });
      if (error) throw error;
      return data as AdoptionPointRow[];
    },
  });

  const { chartData, customers } = useMemo(() => {
    const names = Array.from(new Set(points.map((point) => point.portal_customers?.name || point.customer_id)));
    const byDate = new Map<string, Record<string, string | number>>();
    for (const point of points) {
      const label = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(`${point.date}T00:00:00`));
      const name = point.portal_customers?.name || point.customer_id;
      const entry = byDate.get(label) || { date: label };
      entry[name] = Number(point.pct_addressable ?? 0);
      byDate.set(label, entry);
    }
    return { chartData: Array.from(byDate.values()), customers: names };
  }, [points]);

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {points.length ? (
        <div className="h-[280px] min-h-[240px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value}%`, "Addressable"]} contentStyle={{ background: "hsl(var(--card-background))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              {customers.map((name, index) => <Line key={name} type="monotone" dataKey={name} stroke={palette[index % palette.length]} strokeWidth={3} dot={{ r: 4 }} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <PreparedPlaceholder />}
      {!points.length ? <p className="text-center text-sm text-muted-foreground">Adoption data being collected — check back soon.</p> : null}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
