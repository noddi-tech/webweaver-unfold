import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Rocket, TrendingUp, Save, RefreshCw } from 'lucide-react';

interface TierConfig {
  id: string;
  tier_type: 'launch' | 'scale';
  fixed_monthly_cost: number;
  per_department_cost: number;
  revenue_percentage: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface ScaleTier {
  id: string;
  tier_number: number;
  revenue_threshold: number;
  take_rate: number;
  revenue_multiplier: number | null;
  rate_reduction: number | null;
}

export function NewPricingManager() {
  const [tiersConfig, setTiersConfig] = useState<TierConfig[]>([]);
  const [scaleTiers, setScaleTiers] = useState<ScaleTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [configResult, tiersResult] = await Promise.all([
        supabase.from('pricing_tiers_config').select('*'),
        supabase.from('pricing_scale_tiers').select('*').order('tier_number', { ascending: true })
      ]);

      if (configResult.error) throw configResult.error;
      if (tiersResult.error) throw tiersResult.error;

      setTiersConfig(configResult.data as TierConfig[]);
      setScaleTiers(tiersResult.data as ScaleTier[]);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast.error('Failed to load pricing configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTierConfig = (tierType: 'launch' | 'scale', field: keyof TierConfig, value: any) => {
    setTiersConfig(prev => prev.map(config => 
      config.tier_type === tierType ? { ...config, [field]: value } : config
    ));
  };

  const updateScaleTier = (tierNumber: number, field: keyof ScaleTier, value: any) => {
    setScaleTiers(prev => prev.map(tier =>
      tier.tier_number === tierNumber ? { ...tier, [field]: value } : tier
    ));
  };

  const saveTierConfig = async (tierType: 'launch' | 'scale') => {
    setIsSaving(true);
    try {
      const config = tiersConfig.find(c => c.tier_type === tierType);
      if (!config) return;

      const { error } = await supabase
        .from('pricing_tiers_config')
        .update({
          fixed_monthly_cost: config.fixed_monthly_cost,
          per_department_cost: config.per_department_cost,
          revenue_percentage: config.revenue_percentage,
          name: config.name,
          description: config.description,
          is_active: config.is_active
        })
        .eq('id', config.id);

      if (error) throw error;
      toast.success(`${tierType === 'launch' ? 'Launch' : 'Scale'} tier saved successfully`);
    } catch (error) {
      console.error('Error saving tier config:', error);
      toast.error('Failed to save tier configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const saveScaleTiers = async () => {
    setIsSaving(true);
    try {
      for (const tier of scaleTiers) {
        const { error } = await supabase
          .from('pricing_scale_tiers')
          .update({
            revenue_threshold: tier.revenue_threshold,
            take_rate: tier.take_rate
          })
          .eq('id', tier.id);

        if (error) throw error;
      }
      toast.success('Scale tiers saved successfully');
    } catch (error) {
      console.error('Error saving scale tiers:', error);
      toast.error('Failed to save scale tiers');
    } finally {
      setIsSaving(false);
    }
  };

  const launchConfig = tiersConfig.find(c => c.tier_type === 'launch');
  const scaleConfig = tiersConfig.find(c => c.tier_type === 'scale');

  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading pricing configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Configuration</CardTitle>
        <CardDescription>Manage Launch and Scale tier pricing settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="launch" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="launch" className="gap-2">
              <Rocket className="w-4 h-4" />
              Launch Tier
            </TabsTrigger>
            <TabsTrigger value="scale" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Scale Tier
            </TabsTrigger>
            <TabsTrigger value="scale-tiers">
              Revenue Tiers (15)
            </TabsTrigger>
          </TabsList>

          {/* Launch Tier Tab */}
          <TabsContent value="launch" className="space-y-6">
            {launchConfig && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="launch-fixed">Fixed Monthly Cost (€)</Label>
                    <Input
                      id="launch-fixed"
                      type="number"
                      value={launchConfig.fixed_monthly_cost}
                      onChange={(e) => updateTierConfig('launch', 'fixed_monthly_cost', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">Currently: {formatCurrency(launchConfig.fixed_monthly_cost)}/month</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launch-percentage">Revenue Percentage</Label>
                    <Input
                      id="launch-percentage"
                      type="number"
                      step="0.001"
                      value={launchConfig.revenue_percentage}
                      onChange={(e) => updateTierConfig('launch', 'revenue_percentage', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">Currently: {formatPercentage(launchConfig.revenue_percentage)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launch-name">Display Name</Label>
                    <Input
                      id="launch-name"
                      value={launchConfig.name}
                      onChange={(e) => updateTierConfig('launch', 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launch-description">Description</Label>
                    <Input
                      id="launch-description"
                      value={launchConfig.description || ''}
                      onChange={(e) => updateTierConfig('launch', 'description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={launchConfig.is_active}
                      onCheckedChange={(checked) => updateTierConfig('launch', 'is_active', checked)}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={() => saveTierConfig('launch')} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Launch Tier
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Scale Tier Tab */}
          <TabsContent value="scale" className="space-y-6">
            {scaleConfig && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scale-fixed">Fixed Monthly Cost (€)</Label>
                    <Input
                      id="scale-fixed"
                      type="number"
                      value={scaleConfig.fixed_monthly_cost}
                      onChange={(e) => updateTierConfig('scale', 'fixed_monthly_cost', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">Currently: {formatCurrency(scaleConfig.fixed_monthly_cost)}/month</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scale-department">Per-Department Cost (€)</Label>
                    <Input
                      id="scale-department"
                      type="number"
                      value={scaleConfig.per_department_cost}
                      onChange={(e) => updateTierConfig('scale', 'per_department_cost', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">Currently: {formatCurrency(scaleConfig.per_department_cost)}/location/month</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scale-name">Display Name</Label>
                    <Input
                      id="scale-name"
                      value={scaleConfig.name}
                      onChange={(e) => updateTierConfig('scale', 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scale-description">Description</Label>
                    <Input
                      id="scale-description"
                      value={scaleConfig.description || ''}
                      onChange={(e) => updateTierConfig('scale', 'description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={scaleConfig.is_active}
                      onCheckedChange={(checked) => updateTierConfig('scale', 'is_active', checked)}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={() => saveTierConfig('scale')} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Scale Tier
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Scale Revenue Tiers Tab */}
          <TabsContent value="scale-tiers" className="space-y-6">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Tier</TableHead>
                    <TableHead>Revenue Threshold (€)</TableHead>
                    <TableHead>Take Rate</TableHead>
                    <TableHead className="text-right">Multiplier</TableHead>
                    <TableHead className="text-right">Rate Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scaleTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.tier_number}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-40"
                          value={tier.revenue_threshold}
                          onChange={(e) => updateScaleTier(tier.tier_number, 'revenue_threshold', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.0001"
                          className="w-28"
                          value={tier.take_rate}
                          onChange={(e) => updateScaleTier(tier.tier_number, 'take_rate', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {tier.revenue_multiplier ? `×${tier.revenue_multiplier}` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {tier.rate_reduction ? `-${(tier.rate_reduction * 100).toFixed(2)}%` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveScaleTiers} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save All Tiers
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
