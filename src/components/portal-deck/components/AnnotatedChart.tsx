import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceDot } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { brand, type } from "../visuals/_brand";
import type { ChartAnnotation, ChartPoint, DeckComponentProps } from "./types";
import { accentStyle } from "./utils";

export interface AnnotatedChartProps extends DeckComponentProps {
  title?: string;
  points: ChartPoint[];
  annotations: ChartAnnotation[];
  valueLabel?: string;
}

export function AnnotatedChart({ title, points, annotations, valueLabel = "Value", density = "sparse", accent = "primary", className }: AnnotatedChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const pointIndex = new Map(points.map((point, index) => [point.label, index]));
  return (
    <section className={cn("space-y-6", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline}>{title}</h2> : null}
      <div className="relative rounded-md border border-border bg-card-background p-6">
        <ChartContainer className={cn("w-full", density === "dense" ? "h-[320px]" : "h-[420px]")} config={{ value: { label: valueLabel, color: brand.chartPrimary } }}>
          <LineChart data={points} margin={{ left: 12, right: 24, top: 24, bottom: 16 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} domain={[0, Math.ceil(max * 1.16)]} />
            <Line type="monotone" dataKey="value" stroke="var(--deck-accent)" strokeWidth={3} dot={{ r: 4, fill: "var(--deck-accent)" }} activeDot={false} />
            {annotations.map((annotation) => {
              const point = points.find((item) => item.label === annotation.pointLabel);
              return point ? <ReferenceDot key={annotation.label} x={point.label} y={point.value} r={6} fill={brand.surfaceBackground} stroke="var(--deck-accent)" strokeWidth={3} /> : null;
            })}
          </LineChart>
        </ChartContainer>
        {annotations.map((annotation, index) => {
          const idx = pointIndex.get(annotation.pointLabel) ?? index;
          const left = `${Math.min(82, Math.max(10, 12 + idx * (76 / Math.max(points.length - 1, 1))))}%`;
          const point = points[idx] ?? points[0];
          const top = `${Math.min(72, Math.max(12, 76 - (point.value / max) * 58))}%`;
          return (
            <div key={annotation.label} className={cn("absolute max-w-[220px] rounded-md border border-border bg-background/95 p-3 shadow-sm", annotation.align === "right" ? "translate-x-4" : "-translate-x-full")} style={{ left, top }}>
              <div className="mb-2 h-px w-10" style={{ background: "var(--deck-accent)" }} />
              <p className="text-sm font-semibold text-foreground">{annotation.label}</p>
              {annotation.description ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{annotation.description}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
