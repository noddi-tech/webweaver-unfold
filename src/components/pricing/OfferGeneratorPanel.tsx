import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Send, Loader2, Check, Calculator, RotateCcw, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencySwitcher } from './CurrencySwitcher';
import { LAUNCH_CONFIG, SCALE_CONFIG, generateScaleTiers } from '@/config/newPricing';
import { toast } from 'sonner';

export interface CalculatorValues {
  annualRevenue: number;
  locations: number;
  recommendation: 'launch' | 'scale';
}

interface OfferGeneratorPanelProps {
  // Pre-filled from calculator
  initialTier?: 'launch' | 'scale';
  initialRevenue?: number;
  initialLocations?: number;
  calculatorValues?: CalculatorValues;
}

export function OfferGeneratorPanel({
  initialTier = 'launch',
  initialRevenue = 5000000,
  initialLocations = 1,
  calculatorValues
}: OfferGeneratorPanelProps) {
  const { formatAmountWithSpaces, currency, config } = useCurrency();
  
  // Generate scale tiers for dropdown
  const scaleTiers = useMemo(() => generateScaleTiers(), []);
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Pricing
  const [tier, setTier] = useState<'launch' | 'scale'>(initialTier);
  const [annualRevenue, setAnnualRevenue] = useState(initialRevenue);
  const [locations, setLocations] = useState(initialLocations);
  const [revenuePercentage, setRevenuePercentage] = useState(tier === 'launch' ? LAUNCH_CONFIG.revenuePercentage * 100 : SCALE_CONFIG.baseTakeRate * 100);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
  const [manualTierOverride, setManualTierOverride] = useState(false);
  
  // Notes and state
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(14);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [savedOfferId, setSavedOfferId] = useState<string | null>(null);

  // Auto-calculate fixed monthly based on tier and locations
  const fixedMonthly = tier === 'launch' 
    ? LAUNCH_CONFIG.fixedMonthly 
    : SCALE_CONFIG.fixedMonthly + (locations * SCALE_CONFIG.perDepartment);

  // Auto-detect tier based on annual revenue
  const autoDetectedTierIndex = useMemo(() => {
    if (tier === 'launch') return 0;
    
    // Find the highest tier where revenue meets threshold
    for (let i = scaleTiers.length - 1; i >= 0; i--) {
      if (annualRevenue >= scaleTiers[i].revenueThreshold) {
        return i;
      }
    }
    return 0; // Default to tier 1
  }, [annualRevenue, tier, scaleTiers]);

  // Update tier when revenue changes (if not manually overridden)
  useEffect(() => {
    if (tier === 'scale' && !manualTierOverride) {
      setSelectedTierIndex(autoDetectedTierIndex);
      setRevenuePercentage(scaleTiers[autoDetectedTierIndex].takeRate * 100);
    }
  }, [autoDetectedTierIndex, tier, manualTierOverride, scaleTiers]);

  // Update revenue percentage when tier type changes
  useEffect(() => {
    if (tier === 'launch') {
      setRevenuePercentage(LAUNCH_CONFIG.revenuePercentage * 100);
      setLocations(1);
      setManualTierOverride(false);
    } else {
      setSelectedTierIndex(autoDetectedTierIndex);
      setRevenuePercentage(scaleTiers[autoDetectedTierIndex].takeRate * 100);
    }
  }, [tier, autoDetectedTierIndex, scaleTiers]);

  // Calculate costs - discount now applies to yearly total
  const monthlyRevenue = annualRevenue / 12;
  const revenueCost = monthlyRevenue * (revenuePercentage / 100);
  const totalMonthlyBeforeDiscount = fixedMonthly + revenueCost;
  const totalYearlyBeforeDiscount = totalMonthlyBeforeDiscount * 12;
  const totalYearlyAfterDiscount = totalYearlyBeforeDiscount * (1 - discountPercentage / 100);
  const totalMonthlyAfterDiscount = totalYearlyAfterDiscount / 12;
  const effectiveRate = (totalMonthlyAfterDiscount / monthlyRevenue) * 100;

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);

  // Copy values from calculator
  const handleCopyFromCalculator = () => {
    if (!calculatorValues) {
      toast.error('No calculator values available');
      return;
    }
    
    setAnnualRevenue(calculatorValues.annualRevenue);
    setLocations(calculatorValues.locations);
    setTier(calculatorValues.recommendation);
    setManualTierOverride(false);
    toast.success('Values copied from calculator');
  };

  // Format number with spaces as thousands separator
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(Math.round(num));
  };

  const handleSaveOffer = async (): Promise<string | null> => {
    if (!customerName || !customerEmail || !companyName) {
      toast.error('Please fill in customer details');
      return null;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('pricing_offers')
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_company: companyName,
          tier: tier,
          annual_revenue: annualRevenue,
          locations,
          fixed_monthly: fixedMonthly,
          revenue_percentage: revenuePercentage,
          discount_percentage: discountPercentage,
          total_monthly_estimate: totalMonthlyAfterDiscount,
          total_yearly_estimate: totalYearlyAfterDiscount,
          notes,
          expires_at: validUntil.toISOString(),
          created_by: userData.user?.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSavedOfferId(data.id);
      toast.success('Offer saved as draft');
      return data.id;
    } catch (error: any) {
      console.error('Error saving offer:', error);
      toast.error('Failed to save offer');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOffer = async () => {
    let offerIdToSend = savedOfferId;
    
    if (!offerIdToSend) {
      offerIdToSend = await handleSaveOffer();
      if (!offerIdToSend) {
        toast.error('Failed to save offer before sending');
        return;
      }
    }

    if (!customerEmail) {
      toast.error('Customer email is required');
      return;
    }

    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('send-pricing-offer', {
        body: {
          offerId: offerIdToSend,
          customerEmail,
          customerName,
          customerCompany: companyName,
          tier,
          fixedMonthly,
          revenuePercentage,
          discountPercentage,
          estimatedAnnualRevenue: annualRevenue,
          locations,
          validUntil: validUntil.toISOString(),
          notes
        }
      });

      if (response.error) throw response.error;
      
      toast.success('Offer sent to ' + customerEmail);
    } catch (error: any) {
      console.error('Error sending offer:', error);
      toast.error('Failed to send offer: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-t-lg border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-primary-foreground">
            <FileText className="h-5 w-5 text-primary-foreground" />
            Generate Pricing Offer
          </CardTitle>
          <div className="flex items-center gap-3">
            {calculatorValues && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyFromCalculator}
                className="gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Copy className="h-4 w-4" />
                Copy from Calculator
              </Button>
            )}
            <CurrencySwitcher variant="compact" darkMode showLabel />
            {savedOfferId && (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" /> Draft Saved
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-primary-foreground uppercase tracking-wide">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-primary-foreground">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-primary-foreground">Contact Name</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-primary-foreground">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="john@acme.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-primary/80 to-primary/90 border border-primary-foreground/20">
          <h3 className="font-semibold text-sm text-primary-foreground uppercase tracking-wide">Pricing Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-primary-foreground">Tier</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as 'launch' | 'scale')}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="launch">Launch (Single Location)</SelectItem>
                  <SelectItem value="scale">Scale (Multi-Location)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-primary-foreground">Locations</Label>
              <Input
                type="number"
                min={1}
                value={locations}
                onChange={(e) => setLocations(parseInt(e.target.value) || 1)}
                disabled={tier === 'launch'}
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-primary-foreground">Annual Revenue ({currency})</Label>
              <Input
                type="text"
                value={formatNumber(annualRevenue * config.conversionRate)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d]/g, '');
                  const numericValue = parseInt(cleaned) || 0;
                  setAnnualRevenue(numericValue / config.conversionRate);
                  // Reset manual override when revenue changes
                  if (tier === 'scale') {
                    setManualTierOverride(false);
                  }
                }}
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary-foreground">Fixed Monthly ({currency})</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={formatAmountWithSpaces(fixedMonthly)}
                  disabled
                  className="bg-white/20 text-primary-foreground border-primary-foreground/30"
                />
                <Badge variant="outline" className="whitespace-nowrap text-primary-foreground border-primary-foreground/50">
                  Auto
                </Badge>
              </div>
              {tier === 'scale' && (
                <p className="text-xs text-primary-foreground/80">
                  {config.symbol}{formatNumber(SCALE_CONFIG.fixedMonthly * config.conversionRate)} base + {locations} × {config.symbol}{formatNumber(SCALE_CONFIG.perDepartment * config.conversionRate)}/location
                </p>
              )}
            </div>
          </div>

          {/* Revenue Tier Dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-primary-foreground">Revenue Tier</Label>
              {tier === 'scale' && manualTierOverride && (
                <Badge variant="outline" className="text-xs text-amber-200 border-amber-200/50 bg-amber-500/20">
                  Manual Override
                </Badge>
              )}
            </div>
            
            {tier === 'launch' ? (
              <div className="p-3 rounded-lg bg-white/20 text-primary-foreground">
                <span className="font-semibold">Fixed rate: {(LAUNCH_CONFIG.revenuePercentage * 100).toFixed(1)}%</span>
                <span className="text-primary-foreground/70 ml-2">of platform revenue</span>
              </div>
            ) : (
              <>
                <Select 
                  value={selectedTierIndex.toString()} 
                  onValueChange={(v) => {
                    const index = parseInt(v);
                    setSelectedTierIndex(index);
                    setManualTierOverride(true);
                    setRevenuePercentage(scaleTiers[index].takeRate * 100);
                  }}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Select revenue tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {scaleTiers.map((t, index) => (
                      <SelectItem 
                        key={t.tier} 
                        value={index.toString()}
                        className={autoDetectedTierIndex === index ? 'font-bold bg-primary/10' : ''}
                      >
                        Tier {t.tier}: {(t.takeRate * 100).toFixed(2)}% ({config.symbol}{formatNumber(t.revenueThreshold * config.conversionRate)}+)
                        {autoDetectedTierIndex === index && ' ← Auto'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {manualTierOverride && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary-foreground hover:bg-white/20 gap-1"
                    onClick={() => {
                      setManualTierOverride(false);
                      setSelectedTierIndex(autoDetectedTierIndex);
                      setRevenuePercentage(scaleTiers[autoDetectedTierIndex].takeRate * 100);
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to auto-detected (Tier {scaleTiers[autoDetectedTierIndex].tier})
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-primary-foreground">Yearly Discount: {discountPercentage}%</Label>
              {discountPercentage > 0 && (
                <Badge className="bg-green-500/30 text-green-200 border border-green-300/50">
                  -{discountPercentage}% off yearly total
                </Badge>
              )}
            </div>
            <Slider
              value={[discountPercentage]}
              onValueChange={([v]) => setDiscountPercentage(v)}
              min={0}
              max={20}
              step={1}
              className="py-2"
            />
          </div>
        </div>

        {/* Calculated Summary */}
        <div className="rounded-lg bg-muted border border-border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Calculator className="h-4 w-4" />
            Offer Summary
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-foreground font-medium">Fixed Monthly</p>
              <p className="font-semibold text-foreground">{formatAmountWithSpaces(fixedMonthly)}</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Revenue Share</p>
              <p className="font-semibold text-foreground">{revenuePercentage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Est. Monthly</p>
              <p className="font-semibold text-primary">{formatAmountWithSpaces(totalMonthlyAfterDiscount)}</p>
              {discountPercentage > 0 && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatAmountWithSpaces(totalMonthlyBeforeDiscount)}
                </p>
              )}
            </div>
            <div>
              <p className="text-foreground font-medium">Effective Rate</p>
              <p className="font-semibold text-foreground">{effectiveRate.toFixed(2)}%</p>
            </div>
          </div>
          
          {/* Yearly totals with discount breakdown */}
          <div className="pt-3 border-t border-border mt-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground font-medium">Yearly Total</span>
              <div className="text-right">
                <span className="font-bold text-lg text-primary">
                  {formatAmountWithSpaces(totalYearlyAfterDiscount)}
                </span>
                {discountPercentage > 0 && (
                  <span className="ml-2 text-muted-foreground line-through">
                    {formatAmountWithSpaces(totalYearlyBeforeDiscount)}
                  </span>
                )}
              </div>
            </div>
            {discountPercentage > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 text-right mt-1">
                Saving {formatAmountWithSpaces(totalYearlyBeforeDiscount - totalYearlyAfterDiscount)}/year
              </p>
            )}
          </div>
        </div>

        {/* Notes and Validity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label className="text-primary-foreground">Notes for Customer</Label>
            <Textarea
              placeholder="Any special terms, conditions, or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-primary-foreground">Valid for (days)</Label>
            <Select value={validDays.toString()} onValueChange={(v) => setValidDays(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-primary-foreground/70">
              Expires: {validUntil.toLocaleDateString('nb-NO')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSaveOffer}
            disabled={isSaving || isSending}
            className="flex-1 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><FileText className="h-4 w-4 mr-2" /> Save Draft</>
            )}
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={isSaving || isSending || !customerEmail}
            className="flex-1 bg-gradient-to-r from-primary to-blue-600"
          >
            {isSending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Send Offer</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}