import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useInvestorSession } from "@/hooks/useInvestorSession";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WRONG_PASSWORD_ERROR = "Access code is incorrect. Please check your invitation email or contact tom@naviosolutions.com.";
const GENERIC_ERROR = "We could not verify your access. Please try again or contact tom@naviosolutions.com.";

export function InvestorGateForm() {
  const navigate = useNavigate();
  const { setSession } = useInvestorSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [firm, setFirm] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const isSubmitDisabled = useMemo(() => {
    return (
      loading ||
      name.trim().length < 2 ||
      !EMAIL_RE.test(normalizedEmail) ||
      password.trim().length === 0
    );
  }, [loading, name, normalizedEmail, password]);

  const focusFirstInvalidField = () => {
    if (name.trim().length < 2) {
      nameRef.current?.focus();
      return true;
    }
    if (!EMAIL_RE.test(normalizedEmail)) {
      emailRef.current?.focus();
      return true;
    }
    if (password.trim().length === 0) {
      passwordRef.current?.focus();
      return true;
    }
    return false;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedFirm = firm.trim();
    const accessCode = password;

    if (focusFirstInvalidField()) return;

    setLoading(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "validate-portal-access",
      { body: { name: trimmedName, email: normalizedEmail, firm: trimmedFirm || null, password: accessCode } }
    );

    if (invokeError) {
      const status = (invokeError as any)?.context?.status;
      setError(status === 401 ? WRONG_PASSWORD_ERROR : GENERIC_ERROR);
      setLoading(false);
      return;
    }

    if (data?.success === false) {
      setError(WRONG_PASSWORD_ERROR);
      setLoading(false);
      return;
    }

    if (data?.success === true && data?.data?.session_id) {
      const requiresNda = data.data.requires_nda === true;
      setSession({
        sessionId: data.data.session_id,
        email: normalizedEmail,
        name: trimmedName,
        firm: trimmedFirm || null,
        hasAcceptedNda: !requiresNda,
      });
      navigate(requiresNda ? "/investor/nda" : "/portal");
      return;
    }

    setError(GENERIC_ERROR);
    setLoading(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && isSubmitDisabled && !loading) {
      event.preventDefault();
      focusFirstInvalidField();
    }
  };

  return (
    <Card className="glass-card rounded-2xl p-8 w-full">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-2">
        INVESTOR PORTAL
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3 leading-tight">
        Welcome.
      </h1>
      <p className="text-base text-muted-foreground mb-8">
        A private space for investors evaluating the Series A round. Enter your details to continue.
      </p>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
        <div className="mb-5">
          <Label htmlFor="investor-name" className="mb-2 block">Full name</Label>
          <Input
            ref={nameRef}
            id="investor-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>

        <div className="mb-5">
          <Label htmlFor="investor-email" className="mb-2 block">Email address</Label>
          <Input
            ref={emailRef}
            id="investor-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@firm.com"
            autoComplete="email"
          />
        </div>

        <div className="mb-5">
          <Label htmlFor="investor-firm" className="mb-2 block">Firm (optional)</Label>
          <Input
            id="investor-firm"
            value={firm}
            onChange={(event) => setFirm(event.target.value)}
            placeholder="Acme Capital"
            autoComplete="organization"
          />
        </div>

        <div className="mb-5">
          <Label htmlFor="investor-access-code" className="mb-2 block">Access code</Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="investor-access-code"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="off"
              className="pr-12"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide access code" : "Show access code"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive mb-4" aria-live="polite" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitDisabled}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            "Continue"
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          By continuing, you'll be asked to accept the confidentiality terms.
        </p>
      </form>
    </Card>
  );
}
