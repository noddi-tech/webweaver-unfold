import { useContext } from "react";
import { InvestorSessionContext } from "@/contexts/InvestorSessionContext";

export function useInvestorSession() {
  const context = useContext(InvestorSessionContext);
  if (!context) {
    throw new Error("useInvestorSession must be used within InvestorSessionProvider");
  }
  return context;
}
