import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    document.title = mode === "signin" ? "Sign In | Navio" : mode === "signup" ? "Create Account | Navio" : "Reset Password | Navio";
  }, [mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/internal";
      } else if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "Confirm your email to complete signup." });
      } else if (mode === "reset") {
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setMode("signin");
      }
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/internal` },
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'hsl(var(--primary))' }}>
            Navio
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your workspace
          </p>
        </div>

        <Card className="p-6 bg-card border-border">
          {/* Primary: Google Sign In */}
          <Button
            type="button"
            className="w-full h-12 text-base font-medium"
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Collapsible Email/Password */}
          <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-white/10" style={{ color: 'hsl(var(--primary-foreground))' }}>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {mode === "signin" ? "Sign in with email" : mode === "signup" ? "Create account with email" : "Reset password"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${emailOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <form onSubmit={onSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-card-foreground">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {mode !== "reset" && (
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-card-foreground">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                )}
                <Button type="submit" variant="secondary" disabled={loading}>
                  {loading ? "Please wait..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                {mode === "signin" && (
                  <>
                    <button className="underline hover:text-foreground transition-colors block" onClick={() => setMode("reset")}>
                      Forgot password?
                    </button>
                    <button className="underline hover:text-foreground transition-colors block" onClick={() => setMode("signup")}>
                      Need an account? Sign up
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <button className="underline hover:text-foreground transition-colors block" onClick={() => setMode("signin")}>
                    Have an account? Sign in
                  </button>
                )}
                {mode === "reset" && (
                  <button className="underline hover:text-foreground transition-colors block" onClick={() => setMode("signin")}>
                    Back to sign in
                  </button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Link to Internal Hub */}
        <div className="text-center">
          <Link to="/internal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Go to Internal Hub →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
