import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "navio_investor_session";

type PersistedInvestorSession = {
  sessionId: string;
  email: string;
  name: string;
  firm: string | null;
  hasAcceptedNda: boolean;
  ndaAcceptedAt?: string;
};

export interface InvestorSession {
  sessionId: string | null;
  email: string | null;
  name: string | null;
  firm: string | null;
  hasAcceptedNda: boolean;
  isLoaded: boolean;
  setSession: (session: PersistedInvestorSession) => void;
  markNdaAccepted: () => void;
  signOut: () => void;
}

export const InvestorSessionContext = createContext<InvestorSession | undefined>(undefined);

const emptySession = {
  sessionId: null,
  email: null,
  name: null,
  firm: null,
  hasAcceptedNda: false,
};

function createDevSession(): PersistedInvestorSession | null {
  const params = new URLSearchParams(window.location.search);
  if (!import.meta.env.DEV || params.get("dev_session") !== "test") return null;
  // DEV ONLY: Allows automation to bypass /investor gate + NDA
  // by visiting /portal?dev_session=test. import.meta.env.DEV
  // is false in production builds.
  return {
    sessionId: "dev-session-test",
    email: "dev-automation@navio-test.local",
    name: "Dev Automation",
    firm: null,
    hasAcceptedNda: true,
    ndaAcceptedAt: new Date().toISOString(),
  };
}

type InvestorSessionState = Omit<InvestorSession, "isLoaded" | "setSession" | "markNdaAccepted" | "signOut">;

function isPersistedSession(value: unknown): value is PersistedInvestorSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<PersistedInvestorSession>;
  return (
    typeof session.sessionId === "string" &&
    typeof session.email === "string" &&
    typeof session.name === "string" &&
    (typeof session.firm === "string" || session.firm === null) &&
    typeof session.hasAcceptedNda === "boolean"
  );
}

export function InvestorSessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionState, setSessionState] = useState<InvestorSessionState>(() => {
    const devSession = createDevSession();
    if (devSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devSession));
      return devSession;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isPersistedSession(parsed)) {
          return parsed;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    return emptySession;
  });
  const [isLoaded] = useState(true);

  useEffect(() => {
    const devSession = createDevSession();
    if (devSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devSession));
      setSessionState(devSession);
    }
  }, []);

  const setSession = useCallback((session: PersistedInvestorSession) => {
    setSessionState(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const markNdaAccepted = useCallback(() => {
    setSessionState((current) => {
      if (!current.sessionId || !current.email || !current.name) return current;
      const next = { ...current, hasAcceptedNda: true } as PersistedInvestorSession;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const signOut = useCallback(() => {
    setSessionState(emptySession);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<InvestorSession>(() => ({
    ...sessionState,
    isLoaded,
    setSession,
    markNdaAccepted,
    signOut,
  }), [sessionState, isLoaded, setSession, markNdaAccepted, signOut]);

  return (
    <InvestorSessionContext.Provider value={value}>
      {children}
    </InvestorSessionContext.Provider>
  );
}
