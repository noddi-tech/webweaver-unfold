import { ReactNode, useCallback, useEffect, useRef } from "react";
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

  const trackTabTransition = useCallback((nextTab: PortalTabValue) => {
    if (activeTabRef.current === nextTab) return;

    const previousTab = activeTabRef.current;
    trackEvent({
      event_type: "tab_exit",
      path: trackedPathForTab(previousTab),
      payload: { tab: previousTab },
      dwell_seconds: dwellSecondsSince(tabEnteredAtRef.current),
    });
    trackEvent({ event_type: "tab_view", path: trackedPathForTab(nextTab), payload: { tab: nextTab } });
    activeTabRef.current = nextTab;
    tabEnteredAtRef.current = Date.now();
  }, [trackEvent]);

  useEffect(() => {
    document.title = "Investor Fundraise Portal — Navio Solutions";
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Portal] tab effect runs', {
        activeTab,
        activeTabRef_current: activeTabRef.current,
        tabEnteredAtRef_current: tabEnteredAtRef.current,
        hasTrackedInitialView: hasTrackedInitialViewRef.current,
        timestamp: Date.now(),
      });
    }

    if (!hasTrackedInitialViewRef.current) {
      hasTrackedInitialViewRef.current = true;
      activeTabRef.current = activeTab;
      tabEnteredAtRef.current = Date.now();
      trackEvent({ event_type: "tab_view", path: trackedPathForTab(activeTab), payload: { tab: activeTab } });
      return;
    }

    trackTabTransition(activeTab);
  }, [activeTab, trackEvent, trackTabTransition]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Portal] beforeunload effect setup', {
        timestamp: Date.now(),
      });
    }

    const handleBeforeUnload = () => {
      const now = Date.now();
      if (import.meta.env.DEV) {
        console.log('[Portal] beforeunload fires', {
          activeTabRef_current: activeTabRef.current,
          tabEnteredAtRef_current: tabEnteredAtRef.current,
          now,
          computedDwell: Math.max(0, Math.round((now - tabEnteredAtRef.current) / 1000)),
        });
      }

      const currentTab = activeTabRef.current;
      trackEvent({
        event_type: "tab_exit",
        path: trackedPathForTab(currentTab),
        payload: { tab: currentTab },
        dwell_seconds: dwellSecondsSince(tabEnteredAtRef.current),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });
    return () => window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
  }, [trackEvent]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PortalHeader />
      <PortalTabs activeTab={activeTab} onTabChange={trackTabTransition} />
      <section className="mx-auto max-w-screen-2xl px-6 py-12">
        {tabContent[activeTab]}
      </section>
    </main>
  );
}
