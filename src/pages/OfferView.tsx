import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Building2, CheckCircle, FileText, Phone, MessageCircle, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";

const OfferView = () => {
  const { token } = useParams<{ token: string }>();
  const [viewTracked, setViewTracked] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({ name: "", email: "", question: "" });

  // Fetch offer by token
  const { data: offer, isLoading, error, refetch } = useQuery({
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

  // Pre-fill question form with customer info
  useEffect(() => {
    if (offer) {
      setQuestionForm(prev => ({
        ...prev,
        name: offer.customer_name || "",
        email: offer.customer_email || "",
      }));
    }
  }, [offer]);

  // Accept offer mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("accept-offer", {
        body: { offer_token: token },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.already_accepted) {
        toast.info("Du har allerede akseptert dette tilbudet");
      } else {
        toast.success("Tilbudet er akseptert! Vi kontakter deg snart.");
      }
      setShowAcceptDialog(false);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Kunne ikke akseptere tilbudet");
    },
  });

  // Question mutation
  const questionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("send-offer-question", {
        body: {
          offer_token: token,
          ...questionForm,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Spørsmålet er sendt! Vi svarer så snart som mulig.");
      setShowQuestionForm(false);
      setQuestionForm(prev => ({ ...prev, question: "" }));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Kunne ikke sende spørsmålet");
    },
  });

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
  const isAccepted = !!offer.accepted_at;

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
        {/* Status Badges */}
        {isAccepted ? (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <Badge className="bg-green-500 text-white mb-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Akseptert
            </Badge>
            <p className="text-sm text-muted-foreground">
              Du aksepterte dette tilbudet {format(new Date(offer.accepted_at), "d. MMMM yyyy", { locale: nb })}
            </p>
          </div>
        ) : isExpired ? (
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
        {!isExpired && !isAccepted && (
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setShowAcceptDialog(true)}
            >
              <Check className="mr-2 h-5 w-5" />
              Aksepter tilbudet
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" variant="outline" asChild>
                <a href="https://calendly.com/navio/demo" target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book møte
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowQuestionForm(true)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Still spørsmål
              </Button>
            </div>
            <Button size="lg" variant="ghost" className="w-full" asChild>
              <a href="tel:+4792249953">
                <Phone className="mr-2 h-5 w-5" />
                Ring oss: +47 922 49 953
              </a>
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="space-y-4">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Takk for at du valgte Navio!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Vi kontakter deg snart for å fullføre avtalen.
                </p>
              </CardContent>
            </Card>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setShowQuestionForm(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Har du spørsmål? Kontakt oss
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Spørsmål? Svar på e-posten du mottok eller kontakt oss på sales@info.naviosolutions.com</p>
          <p className="mt-2">© {new Date().getFullYear()} Navio. Alle rettigheter reservert.</p>
        </div>
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aksepter tilbudet</DialogTitle>
            <DialogDescription>
              Ved å akseptere dette tilbudet bekrefter du at du ønsker å gå videre med Navio. 
              Vi vil kontakte deg for å fullføre avtalen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{offer.tier === "launch" ? "Launch" : "Scale"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fast månedlig:</span>
                <span className="font-medium">{formatCurrency(offer.fixed_monthly || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Omsetningsandel:</span>
                <span className="font-medium">{(offer.revenue_percentage || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Avbryt
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aksepterer...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Bekreft aksept
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Form Dialog */}
      <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Still et spørsmål</DialogTitle>
            <DialogDescription>
              Har du spørsmål om tilbudet? Skriv til oss så svarer vi så snart som mulig.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={questionForm.name}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ditt navn"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={questionForm.email}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="din@epost.no"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Ditt spørsmål</Label>
              <Textarea
                id="question"
                value={questionForm.question}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Hva lurer du på?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={() => questionMutation.mutate()}
              disabled={questionMutation.isPending || !questionForm.question.trim()}
            >
              {questionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sender...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send spørsmål
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferView;
