import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Building2, CheckCircle, FileText, Phone } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

const OfferView = () => {
  const { token } = useParams<{ token: string }>();
  const [viewTracked, setViewTracked] = useState(false);

  // Fetch offer by token
  const { data: offer, isLoading, error } = useQuery({
    queryKey: ["offer-view", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_offers")
        .select("*")
        .eq("offer_token", token)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  // Track view on mount (once)
  useEffect(() => {
    if (offer && !viewTracked) {
      supabase.functions.invoke("track-offer-view", {
        body: { token },
      }).then(() => {
        setViewTracked(true);
      }).catch((err) => {
        console.error("Failed to track offer view:", err);
      });
    }
  }, [offer, token, viewTracked]);

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Tilbud ikke funnet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dette tilbudet er enten utløpt eller finnes ikke. Vennligst kontakt oss for et nytt tilbud.
            </p>
            <Button className="mt-6" asChild>
              <a href="/no/contact">Kontakt oss</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if offer is expired
  const isExpired = offer.expires_at && new Date(offer.expires_at) < new Date();

  // Calculate estimated monthly cost
  const monthlyRevenue = (offer.annual_revenue || 0) / 12;
  const revenueCost = monthlyRevenue * ((offer.revenue_percentage || 0) / 100);
  const totalMonthly = (offer.fixed_monthly || 0) + revenueCost;
  const effectiveRate = monthlyRevenue > 0 ? ((totalMonthly / monthlyRevenue) * 100).toFixed(2) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Navio</h1>
          <p className="text-primary-foreground/80">Ditt prisforslag</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Status Badge */}
        {isExpired ? (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <Badge variant="destructive" className="mb-2">Utløpt</Badge>
            <p className="text-sm text-muted-foreground">
              Dette tilbudet utløp {format(new Date(offer.expires_at), "d. MMMM yyyy", { locale: nb })}
            </p>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Gyldig til {offer.expires_at ? format(new Date(offer.expires_at), "d. MMMM yyyy", { locale: nb }) : "videre beskjed"}
            </span>
          </div>
        )}

        {/* Customer Info */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{offer.customer_company || "Kunde"}</CardTitle>
                <p className="text-sm text-muted-foreground">{offer.customer_name}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Plan Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>{offer.tier === "launch" ? "Launch" : "Scale"} Plan</CardTitle>
              </div>
              {offer.discount_percentage > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {offer.discount_percentage}% rabatt
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Fast månedlig avgift</p>
                <p className="text-xl font-semibold">{formatCurrency(offer.fixed_monthly || 0)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Omsetningsandel</p>
                <p className="text-xl font-semibold">{(offer.revenue_percentage || 0).toFixed(1)}%</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Estimert månedlig kostnad</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalMonthly)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Effektiv rate: {effectiveRate}% • Basert på {formatCurrency(offer.annual_revenue || 0)} årlig omsetning
              </p>
            </div>

            {offer.locations && offer.locations > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{offer.locations} lokasjoner inkludert</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {offer.notes && (
          <Card className="mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Notat fra teamet vårt:</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{offer.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* CTA Buttons */}
        {!isExpired && (
          <div className="space-y-4">
            <Button size="lg" className="w-full" asChild>
              <a href="https://calendly.com/navio/demo" target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" />
                Book et møte
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <a href="tel:+4792249953">
                <Phone className="mr-2 h-5 w-5" />
                Ring oss: +47 922 49 953
              </a>
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Spørsmål? Svar på e-posten du mottok eller kontakt oss på hello@naviosolutions.com</p>
          <p className="mt-2">© {new Date().getFullYear()} Navio. Alle rettigheter reservert.</p>
        </div>
      </div>
    </div>
  );
};

export default OfferView;
