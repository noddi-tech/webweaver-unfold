import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useInvestorSession } from "@/hooks/useInvestorSession";
import { useScrolledToBottom } from "@/hooks/useScrolledToBottom";

interface NdaScrollGateProps {
  bodyMd?: string;
  isLoading?: boolean;
}

const ACCEPT_ERROR = "We could not record your acceptance. Please try again.";

export function NdaScrollGate({ bodyMd = "", isLoading = false }: NdaScrollGateProps) {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const skipScrollInDev = import.meta.env.DEV && searchParams.get("skip_scroll") === "1";
  const hasScrolledToBottomNormally = useScrolledToBottom(sentinelRef);
  const hasScrolledToBottom = skipScrollInDev || hasScrolledToBottomNormally;
  const { sessionId, markNdaAccepted, signOut } = useInvestorSession();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecline = () => {
    signOut();
    navigate("/investor");
  };

  const handleAccept = async () => {
    if (!sessionId || !accepted || loading) return;

    setLoading(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke("accept-nda", {
      body: { session_id: sessionId },
    });

    if (invokeError || data?.success === false) {
      setError(ACCEPT_ERROR);
      setLoading(false);
      return;
    }

    markNdaAccepted();
    navigate("/portal");
  };

  return (
    <Card className="glass-card rounded-2xl p-6 sm:p-8 w-full">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-2">
        STEP 2 OF 2
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
        Confidentiality Agreement
      </h1>
      <p className="text-base text-muted-foreground mb-8">
        Before continuing, please review and accept the following terms.
      </p>

      <div
        tabIndex={0}
        data-scroll-gate="true"
        className="border border-border rounded-xl bg-background max-h-[50vh] overflow-y-auto p-6 scroll-smooth mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Confidentiality agreement text"
      >
        {isLoading ? (
          <div aria-label="Loading agreement">
            <Skeleton className="h-4 w-11/12 mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-p:leading-relaxed prose-li:leading-relaxed">
            <ReactMarkdown>{bodyMd}</ReactMarkdown>
            <div ref={sentinelRef} className="h-px" aria-hidden="true" />
          </div>
        )}
      </div>

      {!isLoading ? (
        <>
          <div className="flex items-start gap-3 mb-6">
            <Checkbox
              id="nda-acceptance"
              checked={accepted}
              disabled={!hasScrolledToBottom}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              aria-describedby={!hasScrolledToBottom ? "nda-scroll-helper" : undefined}
            />
            <div>
              <label
                htmlFor="nda-acceptance"
                className={`text-sm text-foreground leading-relaxed ${hasScrolledToBottom ? "cursor-pointer" : "opacity-60"}`}
              >
                I have read and accept the confidentiality terms above on behalf of myself and my organization.
              </label>
              {!hasScrolledToBottom ? (
                <p id="nda-scroll-helper" className="text-xs text-muted-foreground italic mt-1" aria-live="polite">
                  Please scroll to the bottom of the agreement to enable.
                </p>
              ) : null}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive mb-4" aria-live="polite" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleDecline}>
              Decline and exit
            </Button>
            <Button
              type="button"
              variant="default"
              size="lg"
              className="sm:min-w-[200px]"
              disabled={!accepted || loading}
              onClick={handleAccept}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Accept and continue"
              )}
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}
