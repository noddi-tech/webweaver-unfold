import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "navio_investor_session";

type PersistedInvestorSession = {
  sessionId: string;
  email: string;
  name: string;
  firm: string | null;
  hasAcceptedNda: boolean;
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
  const [sessionState, setSessionState] = useState(emptySession);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isPersistedSession(parsed)) {
          setSessionState(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
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
