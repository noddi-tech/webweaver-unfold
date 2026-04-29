import { ReactNode, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalHeader } from "@/components/PortalHeader";
import { PortalTabs, type PortalTabValue, resolvePortalTab } from "@/components/PortalTabs";
import { PitchTab } from "@/components/portal-tabs/PitchTab";
import { TractionTab } from "@/components/portal-tabs/TractionTab";
import { FinancialsTab } from "@/components/portal-tabs/FinancialsTab";
import { CustomersTab } from "@/components/portal-tabs/CustomersTab";
import { TeamStoryTab } from "@/components/portal-tabs/TeamStoryTab";
import { InvestTab } from "@/components/portal-tabs/InvestTab";
import { useInvestorTracking } from "@/hooks/useInvestorTracking";

const tabContent: Record<PortalTabValue, ReactNode> = {
  pitch: <PitchTab />,
  traction: <TractionTab />,
  financials: <FinancialsTab />,
  customers: <CustomersTab />,
  team: <TeamStoryTab />,
  invest: <InvestTab />,
};

const trackedPathForTab = (tab: PortalTabValue) => `${window.location.pathname}?tab=${tab}`;
const dwellSecondsSince = (startedAt: number) => Math.max(0, Math.round((Date.now() - startedAt) / 1000));

export default function Portal() {
  const [searchParams] = useSearchParams();
  const activeTab = resolvePortalTab(searchParams.get("tab"));
  const { trackEvent } = useInvestorTracking();
  const activeTabRef = useRef<PortalTabValue>(activeTab);
  const tabEnteredAtRef = useRef(Date.now());
  const hasTrackedInitialViewRef = useRef(false);

  useEffect(() => {
    document.title = "Investor Fundraise Portal — Navio Solutions";
  }, []);

  useEffect(() => {
    if (!hasTrackedInitialViewRef.current) {
      hasTrackedInitialViewRef.current = true;
      activeTabRef.current = activeTab;
      tabEnteredAtRef.current = Date.now();
      trackEvent({ event_type: "tab_view", path: trackedPathForTab(activeTab), payload: { tab: activeTab } });
      return;
    }

    if (activeTabRef.current === activeTab) return;

    const previousTab = activeTabRef.current;
    trackEvent({
      event_type: "tab_exit",
      path: trackedPathForTab(previousTab),
      payload: { tab: previousTab },
      dwell_seconds: dwellSecondsSince(tabEnteredAtRef.current),
    });
    trackEvent({ event_type: "tab_view", path: trackedPathForTab(activeTab), payload: { tab: activeTab } });
    activeTabRef.current = activeTab;
    tabEnteredAtRef.current = Date.now();
  }, [activeTab, trackEvent]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentTab = activeTabRef.current;
      trackEvent({
        event_type: "tab_exit",
        path: trackedPathForTab(currentTab),
        payload: { tab: currentTab },
        dwell_seconds: dwellSecondsSince(tabEnteredAtRef.current),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [trackEvent]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PortalHeader />
      <PortalTabs activeTab={activeTab} />
      <section className="mx-auto max-w-screen-2xl px-6 py-12">
        {tabContent[activeTab]}
      </section>
    </main>
  );
}
