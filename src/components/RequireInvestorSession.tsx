import type React from "react";
import { Navigate } from "react-router-dom";
import { useInvestorSession } from "@/hooks/useInvestorSession";

export function RequireInvestorSession({ children }: { children: React.ReactNode }) {
  const { sessionId, isLoaded } = useInvestorSession();

  if (!isLoaded) return null;
  if (!sessionId) return <Navigate to="/investor" replace />;

  return <>{children}</>;
}
