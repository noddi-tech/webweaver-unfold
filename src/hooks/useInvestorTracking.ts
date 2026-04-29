import { useContext } from "react";
import { InvestorTrackingContext, type TrackedEvent } from "@/contexts/InvestorTrackingContext";

export type { TrackedEvent };

export function useInvestorTracking(): {
  trackEvent: (event: TrackedEvent) => void;
  flush: () => Promise<void>;
} {
  const context = useContext(InvestorTrackingContext);
  if (!context) {
    throw new Error("useInvestorTracking must be used within InvestorTrackingProvider");
  }
  return context;
}
