import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LAUNCH_CONFIG, SCALE_CONFIG, generateScaleTiers, CURRENCY_RATES, CURRENCY_SYMBOLS } from '@/config/newPricing';

interface OfferData {
  id: string;
  customer_company: string | null;
  customer_name: string | null;
  customer_email: string | null;
  notes: string | null;
  expires_at: string | null;
  discount_percentage: number | null;
  status: string | null;
  offer_token: string | null;
  currency: string | null;
  conversion_rate: number | null;
  tier: string | null;
  annual_revenue: number | null;
  fixed_monthly: number | null;
  revenue_percentage: number | null;
  total_monthly_estimate: number | null;
  total_yearly_estimate: number | null;
  locations: number | null;
  created_at: string;
}

interface OfferEditModalProps {
  offer: OfferData | null;
  onClose: () => void;
}

export function OfferEditModal({ offer, onClose }: OfferEditModalProps) {
  const queryClient = useQueryClient();
  const scaleTiers = useMemo(() => generateScaleTiers(), []);

  // Form state
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [tier, setTier] = useState<'launch' | 'scale'>('launch');
  const [locations, setLocations] = useState(1);
  const [annualRevenueEUR, setAnnualRevenueEUR] = useState(0);
  const [revenuePercentage, setRevenuePercentage] = useState(3);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [currency, setCurrency] = useState('EUR');
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [manualTierOverride, setManualTierOverride] = useState(false);

  const conversionRate = CURRENCY_RATES[currency] || 1;
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '€';

  // Initialize form when offer changes
  useEffect(() => {
    if (offer) {
      setCustomerCompany(offer.customer_company || '');
      setCustomerName(offer.customer_name || '');
      setCustomerEmail(offer.customer_email || '');
      setNotes(offer.notes || '');
      setExpiresAt(offer.expires_at ? offer.expires_at.split('T')[0] : '');
      setTier((offer.tier as 'launch' | 'scale') || 'launch');
      setLocations(offer.locations || 1);
      setAnnualRevenueEUR(offer.annual_revenue || 0);
      setRevenuePercentage(offer.revenue_percentage || 3);
      setDiscountPercentage(offer.discount_percentage || 0);
      setCurrency(offer.currency || 'EUR');
      setManualTierOverride(false);
    }
  }, [offer]);

  // Auto-calculate fixed monthly based on tier and locations
  const fixedMonthlyEUR = tier === 'launch' 
    ? LAUNCH_CONFIG.fixedMonthly 
    : SCALE_CONFIG.fixedMonthly + (locations * SCALE_CONFIG.perDepartment);

  // Auto-detect tier based on annual revenue
  const autoDetectedTierIndex = useMemo(() => {
    if (tier === 'launch') return 0;
    for (let i = scaleTiers.length - 1; i >= 0; i--) {
      if (annualRevenueEUR >= scaleTiers[i].revenueThreshold) {
        return i;
      }
    }
    return 0;
  }, [annualRevenueEUR, tier, scaleTiers]);

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

  // Calculate costs (all in EUR base)
  const monthlyRevenueEUR = annualRevenueEUR / 12;
  const revenueCostEUR = monthlyRevenueEUR * (revenuePercentage / 100);
  const totalMonthlyBeforeDiscountEUR = fixedMonthlyEUR + revenueCostEUR;
  const totalYearlyBeforeDiscountEUR = totalMonthlyBeforeDiscountEUR * 12;
  const totalYearlyAfterDiscountEUR = totalYearlyBeforeDiscountEUR * (1 - discountPercentage / 100);
  const totalMonthlyAfterDiscountEUR = totalYearlyAfterDiscountEUR / 12;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(num));
  };

  const formatCurrency = (amountEUR: number): string => {
    const displayAmount = amountEUR * conversionRate;
    return `${currencySymbol}${formatNumber(displayAmount)}`;
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!offer) throw new Error('No offer to update');

      const { error } = await supabase
        .from('pricing_offers')
        .update({
          customer_company: customerCompany,
          customer_name: customerName,
          customer_email: customerEmail,
          notes,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          tier,
          locations,
          annual_revenue: annualRevenueEUR,
          fixed_monthly: fixedMonthlyEUR,
          revenue_percentage: revenuePercentage,
          discount_percentage: discountPercentage,
          total_monthly_estimate: totalMonthlyAfterDiscountEUR,
          total_yearly_estimate: totalYearlyAfterDiscountEUR,
          currency,
          conversion_rate: conversionRate,
        })
        .eq('id', offer.id);

      if (error) throw error;

      // If offer has a linked lead, sync lead data
      const { data: updatedOffer } = await supabase
        .from('pricing_offers')
        .select('lead_id')
        .eq('id', offer.id)
        .single();

      if (updatedOffer?.lead_id) {
        await supabase
          .from('leads')
          .update({
            company_name: customerCompany,
            contact_name: customerName,
            email: customerEmail,
            estimated_revenue: annualRevenueEUR,
            estimated_locations: locations,
          })
          .eq('id', updatedOffer.lead_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-offers'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`Offer updated in ${currency} (rate ${conversionRate})`);
      onClose();
    },
    onError: (error: Error) => {
      toast.error('Failed to update offer: ' + error.message);
    }
  });

  if (!offer) return null;

  return (
    <Dialog open={!!offer} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Offer</DialogTitle>
          <DialogDescription>
            Update all offer details for {offer.customer_company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Customer Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing Configuration */}
          <div className="space-y-4 p-4 rounded-lg bg-primary/5 border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Pricing Configuration</h3>
              <Select value={currency} onValueChange={(v) => setCurrency(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CURRENCY_RATES).map((code) => (
                    <SelectItem key={code} value={code}>
                      {CURRENCY_SYMBOLS[code]} {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={tier} onValueChange={(v) => setTier(v as 'launch' | 'scale')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="launch">Launch (Single Location)</SelectItem>
                    <SelectItem value="scale">Scale (Multi-Location)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Locations</Label>
                <Input
                  type="number"
                  min={1}
                  value={locations}
                  onChange={(e) => setLocations(parseInt(e.target.value) || 1)}
                  disabled={tier === 'launch'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Revenue ({currency})</Label>
                <Input
                  type="text"
                  value={formatNumber(annualRevenueEUR * conversionRate)}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, '');
                    const numericValue = parseInt(cleaned) || 0;
                    setAnnualRevenueEUR(numericValue / conversionRate);
                    if (tier === 'scale') setManualTierOverride(false);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Fixed Monthly ({currency})</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={formatCurrency(fixedMonthlyEUR)}
                    disabled
                    className="bg-muted"
                  />
                  <Badge variant="outline">Auto</Badge>
                </div>
              </div>
            </div>

            {/* Revenue Tier Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Revenue Tier</Label>
                {tier === 'scale' && manualTierOverride && (
                  <Badge variant="secondary" className="text-xs">Manual Override</Badge>
                )}
              </div>
              
              {tier === 'launch' ? (
                <div className="p-3 rounded-lg bg-muted">
                  <span className="font-semibold">Fixed rate: {(LAUNCH_CONFIG.revenuePercentage * 100).toFixed(1)}%</span>
                  <span className="text-muted-foreground ml-2">of platform revenue</span>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {scaleTiers.map((t, index) => (
                        <SelectItem 
                          key={t.tier} 
                          value={index.toString()}
                          className={autoDetectedTierIndex === index ? 'font-bold bg-primary/10' : ''}
                        >
                          Tier {t.tier}: {(t.takeRate * 100).toFixed(2)}% ({currencySymbol}{formatNumber(t.revenueThreshold * conversionRate)}+)
                          {autoDetectedTierIndex === index && ' ← Auto'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {manualTierOverride && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1"
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
                <Label>Yearly Discount: {discountPercentage}%</Label>
                {discountPercentage > 0 && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-300">
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
          <div className="rounded-lg bg-muted border p-4 space-y-3">
            <div className="text-sm font-medium text-primary">Offer Summary</div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Fixed Monthly</p>
                <p className="font-semibold">{formatCurrency(fixedMonthlyEUR)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Revenue Share</p>
                <p className="font-semibold">{revenuePercentage.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Monthly</p>
                <p className="font-semibold text-primary">{formatCurrency(totalMonthlyAfterDiscountEUR)}</p>
                {discountPercentage > 0 && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(totalMonthlyBeforeDiscountEUR)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Est. Yearly</p>
                <p className="font-semibold text-primary">{formatCurrency(totalYearlyAfterDiscountEUR)}</p>
              </div>
            </div>
          </div>

          {/* Notes and Validity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Valid Until</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
