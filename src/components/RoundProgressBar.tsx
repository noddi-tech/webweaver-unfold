import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoundProgressRow {
  total_pledged_firm_nok: number | string | null;
  total_pledged_all_nok: number | string | null;
  pledge_count: number | null;
  round_size_max_nok: number | string | null;
}

const formatNokMillions = (nok: number) => {
  const value = nok / 1_000_000;
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
  return `NOK ${formatted} M`;
};

export function RoundProgressBar() {
  const { data } = useQuery({
    queryKey: ["portal-round-progress"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("portal_round_progress")
        .select("total_pledged_firm_nok,total_pledged_all_nok,pledge_count,round_size_max_nok")
        .maybeSingle();

      if (error) throw error;
      return data as RoundProgressRow | null;
    },
    refetchInterval: 30_000,
    retry: false,
  });

  const pledged = Number(data?.total_pledged_firm_nok ?? 0);
  const max = Number(data?.round_size_max_nok ?? 0);

  if (!pledged || !max) return null;

  const percentage = Math.min(100, Math.max(0, (pledged / max) * 100));

  return (
    <div className="w-full min-w-[180px] md:max-w-xs" aria-label="Fundraise pledge progress">
      <div className="h-0.5 w-full overflow-hidden bg-muted">
        <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground md:text-right">
        {formatNokMillions(pledged)} of {formatNokMillions(max)} pledged
      </p>
    </div>
  );
}
