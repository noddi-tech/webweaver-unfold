import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

const NewsletterSignup = () => {
  const { t } = useAppTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setLoading(true);
    
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase(), source: "blog" });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: t("newsletter.already_subscribed", "You're already subscribed!"),
          variant: "default",
        });
      } else {
        toast({
          title: t("newsletter.error", "Something went wrong. Please try again."),
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: t("newsletter.success", "Thanks for subscribing!"),
      });
      setEmail("");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          {t("newsletter.title", "Stay Updated")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("newsletter.description", "Subscribe to our newsletter for the latest insights and updates.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={t("newsletter.placeholder", "Enter your email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("newsletter.button", "Subscribe")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
