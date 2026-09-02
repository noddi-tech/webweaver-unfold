import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { analytics, analyticsConfig, getDeviceId, maskText } from "./client";

type AnalyticsValue = {
  track: (name: string, properties?: Record<string, unknown>) => void;
  identify: (profileId: string, profile?: { firstName?: string; lastName?: string; email?: string; properties?: Record<string, unknown> }) => void;
  flush: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsValue | undefined>(undefined);

const LANGS = ["en", "no", "nb", "sv", "da", "de", "fr", "es", "nl", "fi"];

function languageFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && LANGS.includes(first) ? first : "en";
}

function labelOf(element: Element): string {
  const text = (element.textContent ?? "").trim().replace(/\s+/g, " ");
  const raw = (element.getAttribute("aria-label") || text || element.getAttribute("title") || "").slice(0, 80);
  return maskText(raw);
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    analytics.start();
    analytics.setGlobalProperties({
      device_id: getDeviceId(),
      app: "navio-web",
      environment: import.meta.env.DEV ? "development" : "production",
      mask_all_text: analyticsConfig.maskAllText,
    });
    return () => analytics.stop();
  }, []);

  // Page views on every route change
  useEffect(() => {
    analytics.track("screen_view", {
      path: location.pathname,
      search: location.search || undefined,
      language: languageFromPath(location.pathname),
      title: document.title,
      referrer: document.referrer || undefined,
    });
  }, [location.pathname, location.search]);

  // Identity: Supabase auth user
  useEffect(() => {
    const applyUser = (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        analytics.clearIdentity();
        return;
      }
      const fullName = String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "").trim();
      const [firstName, ...rest] = fullName.split(" ");
      analytics.identify(user.id, {
        email: user.email ?? undefined,
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(" ") : undefined,
        properties: { auth_source: "supabase" },
      });
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data }) => applyUser(data.session?.user ?? null));

    return () => subscription.subscription.unsubscribe();
  }, []);

  // CTA clicks + form submissions (delegated)
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.("a, button, [role='button']");
      if (!target) return;

      const explicit = target.getAttribute("data-analytics-id");
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") : null;
      const label = labelOf(target);
      if (!explicit && !label && !href) return;

      analytics.track("cta_click", {
        id: explicit ?? undefined,
        label: label || undefined,
        href: href || undefined,
        element: target.tagName.toLowerCase(),
        path: window.location.pathname,
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.tagName !== "FORM") return;
      analytics.track("form_submit", {
        form: form.getAttribute("data-analytics-id") || form.getAttribute("name") || form.getAttribute("id") || "unnamed_form",
        path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  const track = useCallback((name: string, properties: Record<string, unknown> = {}) => analytics.track(name, properties), []);
  const identify = useCallback<AnalyticsValue["identify"]>((profileId, profile) => analytics.identify(profileId, profile), []);
  const flush = useCallback(() => analytics.flush(), []);

  const value = useMemo(() => ({ track, identify, flush }), [track, identify, flush]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsValue {
  const context = useContext(AnalyticsContext);
  if (context) return context;
  // Safe fallback so components outside the provider never crash.
  return {
    track: (name, properties) => analytics.track(name, properties ?? {}),
    identify: (profileId, profile) => analytics.identify(profileId, profile),
    flush: () => analytics.flush(),
  };
}
