import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatGrid, type MetricItem } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { RoundConfig, SlideVisualProps } from "../types";

interface UseOfFundsItem { label: string; pct: number; }
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
const formatDate = (date: string | null) => date ? new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "—";
const isUseOfFunds = (value: unknown): value is UseOfFundsItem[] => Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && typeof (item as Record<string, unknown>).label === "string" && typeof (item as Record<string, unknown>).pct === "number");

export function RoundVisual({ slide, config }: SlideVisualProps<RoundConfig>) {
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
  const metrics: MetricItem[] = round ? [
    { label: deckText.roundSize, value: `NOK ${formatM(round.round_size_min_nok)}–${formatM(round.round_size_max_nok)} mill.` },
    { label: deckText.indicativeValuation, value: `NOK ${formatM(round.valuation_min_nok)}–${formatM(round.valuation_max_nok)} mill.`, context: deckText.preMoney },
    { label: deckText.useOfFunds, value: funds.length ? funds.map((item) => `${item.pct}% ${item.label}`).join(" · ") : "—" },
    { label: deckText.closing, value: formatDate(round.target_close_date) },
  ] : [];

  return (
    <section className="h-full overflow-hidden p-6 sm:p-10">
      {round ? (
        <div className="space-y-6">
          <StatGrid title={slide.title ?? undefined} metrics={metrics} />
          <div className="flex justify-center"><Button size="lg" onClick={() => navigate("/portal?tab=invest")}>{config?.cta_label ?? deckText.submitIndication}</Button></div>
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
