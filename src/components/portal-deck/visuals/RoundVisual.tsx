import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { SlideVisualProps, VisualConfig } from "../types";

interface UseOfFundsItem {
  label: string;
  pct: number;
}

interface RoundRow {
  id: string;
  round_size_min_nok: number | null;
  round_size_max_nok: number | null;
  valuation_min_nok: number | null;
  valuation_max_nok: number | null;
  use_of_funds: unknown;
  target_close_date: string | null;
}

const formatM = (value: number | null) => value == null ? "—" : `${Math.round(Number(value) / 1_000_000)}`;
const formatDate = (date: string | null) => date ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "—";

function isUseOfFunds(value: unknown): value is UseOfFundsItem[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && "label" in item && "pct" in item && typeof (item as Record<string, unknown>).label === "string" && typeof (item as Record<string, unknown>).pct === "number");
}

export function RoundVisual({ slide }: SlideVisualProps<VisualConfig>) {
  const navigate = useNavigate();
  const { data: round } = useQuery({
    queryKey: ["portal-round-terms-active-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_round_terms")
        .select("id,round_size_min_nok,round_size_max_nok,valuation_min_nok,valuation_max_nok,use_of_funds,target_close_date")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as RoundRow | null;
    },
  });

  const funds = isUseOfFunds(round?.use_of_funds) ? round.use_of_funds : [];

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {round ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-card-surface p-6"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Round size</p><p className="mt-3 text-2xl font-bold text-foreground">NOK {formatM(round.round_size_min_nok)}–{formatM(round.round_size_max_nok)}M</p></div>
            <div className="rounded-xl bg-card-surface p-6"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Indicative valuation</p><p className="mt-3 text-2xl font-bold text-foreground">NOK {formatM(round.valuation_min_nok)}–{formatM(round.valuation_max_nok)}M pre</p></div>
            <div className="rounded-xl bg-card-surface p-6"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Use of funds</p><div className="mt-4 flex h-3 overflow-hidden rounded-full bg-background">{funds.map((item, index) => <div key={item.label} className={index % 2 ? "bg-secondary" : "bg-primary"} style={{ width: `${Math.max(0, Math.min(100, item.pct))}%` }} />)}</div><div className="mt-3 space-y-1">{funds.map((item) => <p key={item.label} className="text-xs text-muted-foreground">{item.pct}% · {item.label}</p>)}</div></div>
            <div className="rounded-xl bg-card-surface p-6"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Closing</p><p className="mt-3 text-2xl font-bold text-foreground">{formatDate(round.target_close_date)}</p></div>
          </div>
          <div className="flex justify-center"><Button size="lg" onClick={() => navigate("/portal?tab=invest")}>Submit indication of interest</Button></div>
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
