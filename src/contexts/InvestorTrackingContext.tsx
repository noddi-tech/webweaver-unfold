import React, { createContext, useCallback, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInvestorSession } from "@/hooks/useInvestorSession";
import { analytics } from "@/analytics/client";

export type TrackedEvent = {
  event_type:
    | "session_start"
    | "session_end"
    | "tab_view"
    | "tab_exit"
    | "slide_view"
    | "slide_exit"
    | "pdf_export"
    | "link_click"
    | "pledge_submitted"
    | "pledge_revised"
    | "nda_accepted";
  path?: string;
  payload?: Record<string, unknown>;
  dwell_seconds?: number;
};

type InvestorTrackingValue = {
  trackEvent: (event: TrackedEvent) => void;
  flush: () => Promise<void>;
};

export const InvestorTrackingContext = createContext<InvestorTrackingValue | undefined>(undefined);

const sharedQueue: TrackedEvent[] = [];
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ouhfgazomdmirdazvjys.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGZnYXpvbWRtaXJkYXp2anlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI5OTEsImV4cCI6MjA3MDE0ODk5MX0.w5iC3BX6u5vrnr1fMj5HyYUwEtYRwsoTVx3oAQ2foCQ";

function snapshotQueue(queue: TrackedEvent[]) {
  const queueSnapshot = [...queue];
  queue.length = 0;
  return queueSnapshot;
}

function keepaliveFlush(sessionId: string | null, queue: TrackedEvent[]) {
  const queueSnapshot = snapshotQueue(queue);
  if (!sessionId || queueSnapshot.length === 0) return;

  try {
    fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ session_id: sessionId, events: queueSnapshot }),
    }).catch((error) => {
      console.warn("[InvestorTracking] keepalive flush failed", error);
    });
  } catch (error) {
    console.warn("[InvestorTracking] keepalive flush failed", error);
  }
}

export function InvestorTrackingProvider({ children }: { children: React.ReactNode }) {
  const { sessionId, email, name, firm } = useInvestorSession();
  const sessionIdRef = useRef(sessionId);
  const queueRef = useRef<TrackedEvent[]>(sharedQueue);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Identify the investor in OpenPanel while their portal session is active.
  useEffect(() => {
    if (!sessionId || !email) return;
    const [firstName, ...rest] = (name ?? "").trim().split(" ");
    analytics.identify(email, {
      email,
      firstName: firstName || undefined,
      lastName: rest.length ? rest.join(" ") : undefined,
      properties: { auth_source: "investor_portal", investor_session_id: sessionId, firm: firm ?? undefined },
    });
  }, [sessionId, email, name, firm]);

  const trackEvent = useCallback((event: TrackedEvent) => {
    queueRef.current.push(event);
    // Mirror investor portal telemetry to OpenPanel (Supabase tracking unchanged).
    analytics.track(`investor_${event.event_type}`, {
      path: event.path,
      dwell_seconds: event.dwell_seconds,
      ...(event.payload ?? {}),
    });
  }, []);


  const flush = useCallback(async () => {
    const queueSnapshot = snapshotQueue(queueRef.current);
    const currentSessionId = sessionIdRef.current;

    if (!currentSessionId || queueSnapshot.length === 0) return;

    const { data, error } = await supabase.functions.invoke("track-event", {
      body: { session_id: currentSessionId, events: queueSnapshot },
    });

    if (error || data?.success === false) {
      console.warn("[InvestorTracking] flush failed", error || data);
      return;
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void flush();
    }, 10_000);

    const handleVisibilityChange = () => {
      if (document.hidden) void flush();
    };

    const handleBeforeUnload = () => {
      queueRef.current.push({
        event_type: "session_end",
        path: window.location.pathname,
      });
      keepaliveFlush(sessionIdRef.current, queueRef.current);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      trackEvent({ event_type: "session_end", path: window.location.pathname });
      keepaliveFlush(sessionIdRef.current, queueRef.current);
    };
  }, [flush, trackEvent]);

  const value = useMemo(() => ({ trackEvent, flush }), [trackEvent, flush]);

  return (
    <InvestorTrackingContext.Provider value={value}>
      {children}
    </InvestorTrackingContext.Provider>
  );
}
