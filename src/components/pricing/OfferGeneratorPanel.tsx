import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Send, Loader2, Check, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';

interface OfferGeneratorPanelProps {
  // Pre-filled from calculator
  initialTier?: 'launch' | 'scale';
  initialRevenue?: number;
  initialLocations?: number;
  initialFixedMonthly?: number;
  initialRevenuePercentage?: number;
}

export function OfferGeneratorPanel({
  initialTier = 'launch',
  initialRevenue = 5000000,
  initialLocations = 1,
  initialFixedMonthly = 4900,
  initialRevenuePercentage = 2.9
}: OfferGeneratorPanelProps) {
  const { formatAmount } = useCurrency();
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Pricing
  const [tier, setTier] = useState<'launch' | 'scale'>(initialTier);
  const [annualRevenue, setAnnualRevenue] = useState(initialRevenue);
  const [locations, setLocations] = useState(initialLocations);
  const [fixedMonthly, setFixedMonthly] = useState(initialFixedMonthly);
  const [revenuePercentage, setRevenuePercentage] = useState(initialRevenuePercentage);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  
  // Notes and state
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(14);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [savedOfferId, setSavedOfferId] = useState<string | null>(null);

  // Calculate costs
  const monthlyRevenue = annualRevenue / 12;
  const effectivePercentage = revenuePercentage * (1 - discountPercentage / 100);
  const revenueCost = monthlyRevenue * (effectivePercentage / 100);
  const totalMonthly = fixedMonthly + revenueCost;
  const effectiveRate = (totalMonthly / monthlyRevenue) * 100;

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);

  const handleSaveOffer = async () => {
    if (!customerName || !customerEmail || !companyName) {
      toast.error('Please fill in customer details');
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const monthlyEstimate = fixedMonthly + (annualRevenue / 12) * (effectivePercentage / 100);
      const yearlyEstimate = monthlyEstimate * 12;

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
          revenue_percentage: effectivePercentage,
          discount_percentage: discountPercentage,
          total_monthly_estimate: monthlyEstimate,
          total_yearly_estimate: yearlyEstimate,
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
    } catch (error: any) {
      console.error('Error saving offer:', error);
      toast.error('Failed to save offer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOffer = async () => {
    if (!savedOfferId) {
      await handleSaveOffer();
    }

    if (!customerEmail) {
      toast.error('Customer email is required');
      return;
    }

    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('send-pricing-offer', {
        body: {
          offerId: savedOfferId,
          customerEmail,
          customerName,
          customerCompany: companyName,
          tier,
          fixedMonthly,
          revenuePercentage: effectivePercentage,
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
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Generate Pricing Offer
          </CardTitle>
          {savedOfferId && (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" /> Draft Saved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Contact Name</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
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
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Pricing Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Annual Revenue (NOK)</Label>
              <Input
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fixed Monthly (NOK)</Label>
              <Input
                type="number"
                value={fixedMonthly}
                onChange={(e) => setFixedMonthly(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Revenue Percentage: {revenuePercentage.toFixed(1)}%</Label>
            <Slider
              value={[revenuePercentage]}
              onValueChange={([v]) => setRevenuePercentage(v)}
              min={0.5}
              max={5}
              step={0.1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Discount: {discountPercentage}%</Label>
              {discountPercentage > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  -{discountPercentage}% off
                </Badge>
              )}
            </div>
            <Slider
              value={[discountPercentage]}
              onValueChange={([v]) => setDiscountPercentage(v)}
              min={0}
              max={30}
              step={5}
              className="py-2"
            />
          </div>
        </div>

        {/* Calculated Summary */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Calculator className="h-4 w-4" />
            Offer Summary
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Fixed Monthly</p>
              <p className="font-semibold">{formatAmount(fixedMonthly)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Revenue Share</p>
              <p className="font-semibold">{effectivePercentage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Monthly</p>
              <p className="font-semibold text-primary">{formatAmount(totalMonthly)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Effective Rate</p>
              <p className="font-semibold">{effectiveRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Notes and Validity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Notes for Customer</Label>
            <Textarea
              placeholder="Any special terms, conditions, or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Valid for (days)</Label>
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
            <p className="text-xs text-muted-foreground">
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
            className="flex-1"
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
