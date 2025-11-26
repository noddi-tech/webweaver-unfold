import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";


const Auth = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = mode === "signin" ? "Sign In | Admin" : "Sign Up | Admin";
  }, [mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/cms";
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-md">
          <Card className="p-6 bg-card border-border">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">
              {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
            </h1>
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
              <Button type="submit" disabled={loading}>
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
              </Button>
            </form>
            <div className="mt-4 text-sm text-card-foreground space-y-2">
              {mode === "signin" && (
                <>
                  <button className="underline hover:text-white transition-colors block" onClick={() => setMode("reset")}>
                    Forgot password?
                  </button>
                  <button className="underline hover:text-white transition-colors block" onClick={() => setMode("signup")}>
                    Need an account? Sign up
                  </button>
                </>
              )}
              {mode === "signup" && (
                <button className="underline hover:text-white transition-colors block" onClick={() => setMode("signin")}>
                  Have an account? Sign in
                </button>
              )}
              {mode === "reset" && (
                <button className="underline hover:text-white transition-colors block" onClick={() => setMode("signin")}>
                  Back to sign in
                </button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
