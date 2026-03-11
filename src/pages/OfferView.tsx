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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Building2, CheckCircle, FileText, Phone, MessageCircle, Check, Loader2, Globe, RefreshCw, Download, Mail, Linkedin, TrendingUp, Wallet, Percent, Tag, CalendarDays, Gauge, Layers } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { CURRENCY_RATES, CURRENCY_SYMBOLS, LAUNCH_CONFIG, SCALE_CONFIG, generateScaleTiers } from "@/config/newPricing";
import { useSalesContacts } from "@/hooks/useSalesContacts";
import { comparePricing, detectScaleTier } from "@/utils/newPricingCalculator";
import { LaunchTierCard } from "@/components/pricing/LaunchTierCard";
import { ScaleTierCard } from "@/components/pricing/ScaleTierCard";
import { ScaleTierTable } from "@/components/pricing/ScaleTierTable";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Currency locale mapping
const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'de-DE',
  NOK: 'nb-NO',
  SEK: 'sv-SE',
  USD: 'en-US',
  GBP: 'en-GB',
};

const OfferView = () => {
  const { token } = useParams<{ token: string }>();
  const [viewTracked, setViewTracked] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({ name: "", email: "", question: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Fetch sales contacts configuration
  const { data: salesContacts } = useSalesContacts();
  
  // Display currency state - defaults to offer's currency
  const [displayCurrency, setDisplayCurrency] = useState<string | null>(null);

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

  // Set display currency to offer's currency when offer loads
  useEffect(() => {
    if (offer && !displayCurrency) {
      setDisplayCurrency(offer.currency || 'EUR');
    }
  }, [offer, displayCurrency]);

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

  // Get the current display currency info
  const currentDisplayCurrency = displayCurrency || offer?.currency || 'EUR';
  const displayConversionRate = CURRENCY_RATES[currentDisplayCurrency] || 1;
  const displaySymbol = CURRENCY_SYMBOLS[currentDisplayCurrency] || '€';

  // Format currency using the selected display currency
  // DB values are stored in EUR base, so we convert from EUR to display currency
  const formatCurrency = (amountEUR: number) => {
    const displayAmount = amountEUR * displayConversionRate;
    const locale = CURRENCY_LOCALES[currentDisplayCurrency] || 'en-US';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currentDisplayCurrency,
      maximumFractionDigits: 0,
    }).format(displayAmount);
  };

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

  // Calculate estimated monthly cost (all values in DB are EUR base)
  const monthlyRevenue = (offer.annual_revenue || 0) / 12;
  const revenueCost = monthlyRevenue * ((offer.revenue_percentage || 0) / 100);
  const totalMonthlyBeforeDiscount = (offer.fixed_monthly || 0) + revenueCost;
  
  // Use stored discounted total if available, otherwise calculate
  const totalMonthly = offer.total_monthly_estimate || totalMonthlyBeforeDiscount;
  const effectiveRate = monthlyRevenue > 0 ? ((totalMonthly / monthlyRevenue) * 100).toFixed(2) : "0";

  // Detailed breakdown calculations
  const discountPct = offer.discount_percentage || 0;
  const perLocationCost = offer.per_location_cost || 0;
  const locationCount = offer.locations || 1;
  const basePlatformFee = perLocationCost > 0 
    ? (offer.fixed_monthly || 0) - (perLocationCost * locationCount)
    : (offer.fixed_monthly || 0);
  const totalFixedBeforeDiscount = offer.fixed_monthly || 0;
  const totalFixedAfterDiscount = totalFixedBeforeDiscount * (1 - discountPct / 100);
  
  const baseTakeRate = offer.revenue_percentage || 0;
  const discountedTakeRate = baseTakeRate * (1 - discountPct / 100);
  const monthlyRevenueCost = monthlyRevenue * (discountedTakeRate / 100);

  // Scale tiers & savings comparison
  const scaleTiers = generateScaleTiers();
  const { tier: currentTierNumber } = detectScaleTier(offer.annual_revenue || 0, scaleTiers);
  const nextTier = scaleTiers.find(t => t.tier === currentTierNumber + 1);
  const compLocationCount = offer.locations || 1;
  const isLaunchAvailable = locationCount === 1;
  const comparison = comparePricing(offer.annual_revenue || 0, locationCount, LAUNCH_CONFIG, SCALE_CONFIG, scaleTiers, isLaunchAvailable);
  const monthlySavings = Math.round(comparison.savingsAmount / 12);
  const savingsLabel = monthlySavings > 0 ? `${formatCurrency(monthlySavings)}/mnd` : undefined;

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
        {/* Last Updated & Currency Switcher */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          {/* Last Updated Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Sist oppdatert: {format(new Date(offer.updated_at || offer.created_at), "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
              <span className="text-xs ml-1">
                ({formatDistanceToNow(new Date(offer.updated_at || offer.created_at), { addSuffix: true, locale: nb })})
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={async () => {
                setIsRefreshing(true);
                await refetch();
                setIsRefreshing(false);
                toast.success("Tilbudet er oppdatert");
              }}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currentDisplayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CURRENCY_RATES).map((code) => (
                  <SelectItem key={code} value={code}>
                    {CURRENCY_SYMBOLS[code]} {code}
                    {code === offer.currency && ' ✓'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Show note if viewing in different currency */}
        {currentDisplayCurrency !== offer.currency && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-center text-sm text-blue-700 dark:text-blue-300">
            Viser beløp i {currentDisplayCurrency}. Tilbudet ble opprettet i {offer.currency}.
          </div>
        )}

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

        {/* Customer Info - Start of PDF content */}
        <div id="offer-content" className="bg-background">
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
        <Card className="mb-6 overflow-hidden">
          {/* Discount Banner */}
          {offer.discount_percentage > 0 && (
            <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-center gap-2">
              <Tag className="h-5 w-5" />
              <span className="font-semibold text-lg">{offer.discount_percentage}% rabatt på dette tilbudet</span>
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{offer.tier === "launch" ? "Launch" : "Scale"} Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Annual Revenue */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Årlig omsetning</p>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(offer.annual_revenue || 0)}</p>
            </div>

            {/* Fixed Cost Breakdown */}
            <div className="p-5 bg-muted/30 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Fast månedlig kostnad</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plattformavgift</span>
                  <span>{formatCurrency(basePlatformFee)}</span>
                </div>
                {perLocationCost > 0 && locationCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lokasjonskostnad ({formatCurrency(perLocationCost)} × {locationCount})</span>
                    <span>{formatCurrency(perLocationCost * locationCount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/50 pt-1.5">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totalFixedBeforeDiscount)}/mnd</span>
                </div>
                {discountPct > 0 && (
                  <>
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {discountPct}% rabatt</span>
                      <span>-{formatCurrency(totalFixedBeforeDiscount - totalFixedAfterDiscount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/50 pt-1.5">
                      <span className="font-semibold">Din fast kostnad</span>
                      <span className="font-bold text-primary">{formatCurrency(totalFixedAfterDiscount)}/mnd</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Take Rate Breakdown */}
            <div className="p-5 bg-muted/30 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Omsetningsbasert kostnad</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base take rate</span>
                  <span>{baseTakeRate.toFixed(2)}%</span>
                </div>
                {discountPct > 0 && (
                  <>
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {discountPct}% rabatt</span>
                      <span>-{(baseTakeRate - discountedTakeRate).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-t border-border/50 pt-1.5">
                      <span className="font-semibold">Din take rate</span>
                      <span className="font-bold text-primary">{discountedTakeRate.toFixed(2)}%</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-border/50 pt-1.5 text-muted-foreground">
                  <span>Månedlig omsetningskostnad</span>
                  <span>{formatCurrency(monthlyRevenueCost)}/mnd</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(offer.annual_revenue || 0)} × {discountedTakeRate.toFixed(2)}% / 12
                </p>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="p-5 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Estimert månedlig kostnad</span>
                </div>
                <span className="text-3xl font-bold text-primary">{formatCurrency(totalMonthly)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary/70" />
                  <span className="text-sm text-muted-foreground">Estimert årlig kostnad</span>
                </div>
                <span className="text-xl font-semibold text-foreground">{formatCurrency(totalMonthly * 12)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary/70" />
                  <span className="text-sm text-muted-foreground">Effektiv rate</span>
                </div>
                <span className="text-sm font-medium text-foreground">{effectiveRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-1">
                Basert på {formatCurrency(offer.annual_revenue || 0)} i årlig omsetning
              </p>
            </div>
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

        {/* Tier Comparison Section */}
        <CurrencyProvider>
          <div className="mb-6 space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Prismodeller</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Vi har valgt {offer.tier === 'launch' ? 'Launch' : 'Scale'}-modellen for deg — {offer.tier === 'scale' ? 'den mest kostnadseffektive løsningen for din størrelse' : 'perfekt for å komme i gang'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LaunchTierCard 
                config={LAUNCH_CONFIG} 
                isSelected={offer.tier === 'launch'} 
              />
              <ScaleTierCard 
                config={SCALE_CONFIG} 
                tiers={scaleTiers}
                isSelected={offer.tier === 'scale'}
                showDetailedRates={true}
              />
            </div>

            {/* Scale Tier Table */}
            {offer.tier === 'scale' && (
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-1">Ditt volumnivå</h3>
                  <p className="text-sm text-muted-foreground">
                    Din omsetning plasserer deg i <span className="font-semibold text-primary">tier {currentTierNumber}</span>.
                    {nextTier && (
                      <> Ved omsetning over {formatCurrency(nextTier.revenueThreshold)} får du lavere rate ({(nextTier.takeRate * 100).toFixed(2)}%).</>
                    )}
                  </p>
                </div>
                <ScaleTierTable tiers={scaleTiers} currentTier={currentTierNumber} />
              </div>
            )}
          </div>
        </CurrencyProvider>
        </div>
        {/* End of PDF content */}

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
                <a href={salesContacts?.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book møte
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowQuestionForm(true)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Still spørsmål
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                size="lg" 
                variant="outline"
                onClick={async () => {
                  setIsGeneratingPDF(true);
                  try {
                    const { default: jsPDF } = await import('jspdf');
                    const { default: html2canvas } = await import('html2canvas');
                    
                    const element = document.getElementById('offer-content');
                    if (!element) throw new Error('Offer content not found');
                    
                    const canvas = await html2canvas(element, {
                      scale: 2,
                      useCORS: true,
                      backgroundColor: '#ffffff'
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    pdf.save(`Navio-Tilbud-${offer.customer_company || 'Kunde'}.pdf`);
                    toast.success("PDF lastet ned");
                  } catch (error) {
                    console.error('PDF generation error:', error);
                    toast.error("Kunne ikke laste ned PDF");
                  } finally {
                    setIsGeneratingPDF(false);
                  }
                }}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Last ned PDF
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <a href={`tel:${salesContacts?.primaryContact?.phone || salesContacts?.salesPhone || '+4792249953'}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Ring oss
                </a>
              </Button>
            </div>
            
            {/* Sales Contacts Section */}
            {(salesContacts?.primaryContact || salesContacts?.secondaryContact) && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dine kontaktpersoner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {salesContacts.primaryContact && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={salesContacts.primaryContact.image_url || ''} alt={salesContacts.primaryContact.name} />
                          <AvatarFallback>{salesContacts.primaryContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{salesContacts.primaryContact.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{salesContacts.primaryContact.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {salesContacts.primaryContact.phone && (
                              <a href={`tel:${salesContacts.primaryContact.phone}`} className="text-primary hover:underline">
                                <Phone className="h-3 w-3" />
                              </a>
                            )}
                            {salesContacts.primaryContact.email && (
                              <a href={`mailto:${salesContacts.primaryContact.email}`} className="text-primary hover:underline">
                                <Mail className="h-3 w-3" />
                              </a>
                            )}
                            {salesContacts.primaryContact.linkedin_url && (
                              <a href={salesContacts.primaryContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                <Linkedin className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {salesContacts.secondaryContact && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={salesContacts.secondaryContact.image_url || ''} alt={salesContacts.secondaryContact.name} />
                          <AvatarFallback>{salesContacts.secondaryContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{salesContacts.secondaryContact.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{salesContacts.secondaryContact.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {salesContacts.secondaryContact.phone && (
                              <a href={`tel:${salesContacts.secondaryContact.phone}`} className="text-primary hover:underline">
                                <Phone className="h-3 w-3" />
                              </a>
                            )}
                            {salesContacts.secondaryContact.email && (
                              <a href={`mailto:${salesContacts.secondaryContact.email}`} className="text-primary hover:underline">
                                <Mail className="h-3 w-3" />
                              </a>
                            )}
                            {salesContacts.secondaryContact.linkedin_url && (
                              <a href={salesContacts.secondaryContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                <Linkedin className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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
          <p>Spørsmål? Svar på e-posten du mottok eller kontakt oss på {salesContacts?.salesEmail || 'sales@info.naviosolutions.com'}</p>
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
                <span className="font-medium">
                  {discountPct > 0 && <span className="line-through text-muted-foreground mr-1">{formatCurrency(totalFixedBeforeDiscount)}</span>}
                  {formatCurrency(totalFixedAfterDiscount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Take rate:</span>
                <span className="font-medium">
                  {discountPct > 0 && <span className="line-through text-muted-foreground mr-1">{baseTakeRate.toFixed(2)}%</span>}
                  {discountedTakeRate.toFixed(2)}%
                </span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-green-700 dark:text-green-400">
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Rabatt:</span>
                  <span className="font-medium">-{discountPct}%</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-medium">Estimert månedlig:</span>
                <span className="font-bold text-primary">{formatCurrency(totalMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimert årlig:</span>
                <span className="font-semibold">{formatCurrency(totalMonthly * 12)}</span>
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
              disabled={questionMutation.isPending || !questionForm.question}
            >
              {questionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sender...
                </>
              ) : (
                'Send spørsmål'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferView;
