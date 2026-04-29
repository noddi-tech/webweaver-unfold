import { Navigate } from "react-router-dom";
import { RequireInvestorSession } from "@/components/RequireInvestorSession";
import { useInvestorSession } from "@/hooks/useInvestorSession";

export function RequireNdaAccepted({ children }: { children: React.ReactNode }) {
  const { hasAcceptedNda } = useInvestorSession();

  return (
    <RequireInvestorSession>
      {hasAcceptedNda ? children : <Navigate to="/investor/nda" replace />}
    </RequireInvestorSession>
  );
}
