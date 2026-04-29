import type React from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });
    supabase.auth.getSession().then(({ data }) => setAuthenticated(!!data.session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (authenticated === null || roleLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-32 pb-20 px-6">
          <div className="container mx-auto">
            <p className="text-center text-muted-foreground">Checking authentication…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>You don't have permission to access the admin panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Only users with admin privileges can access this area.</p>
              <Button onClick={() => { window.location.href = "/"; }} className="w-full">Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
