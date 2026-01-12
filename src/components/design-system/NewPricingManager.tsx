import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Rocket, TrendingUp, Save, RefreshCw, Calculator } from 'lucide-react';

interface TierConfig {
  id: string;
  tier_type: 'launch' | 'scale';
  fixed_monthly_cost: number;
  per_department_cost: number;
  revenue_percentage: number;
  name: string;
  description: string | null;
  is_active: boolean;
  base_revenue_threshold?: number;
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

  // Recalculate all tiers based on multipliers and rate reductions
  const recalculateTiers = useCallback((
    baseRevenue: number,
    baseTakeRate: number,
    tiers: ScaleTier[]
  ): ScaleTier[] => {
    const result: ScaleTier[] = [];
    let currentRevenue = baseRevenue;
    let currentRate = baseTakeRate;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      
      if (i === 0) {
        // Tier 1 uses base values
        result.push({
          ...tier,
          revenue_threshold: Math.round(baseRevenue),
          take_rate: baseTakeRate
        });
      } else {
        // Apply multiplier from this tier to previous revenue
        const multiplier = tier.revenue_multiplier ?? 1.5;
        const reduction = tier.rate_reduction ?? 0.0005;
        
        currentRevenue = currentRevenue * multiplier;
        currentRate = Math.max(0.005, currentRate - reduction); // Don't go below 0.5%
        
        result.push({
          ...tier,
          revenue_threshold: Math.round(currentRevenue),
          take_rate: currentRate
        });
      }
    }

    return result;
  }, []);

  // Update a specific tier's multiplier or reduction and recalculate downstream
  const updateScaleTierConfig = (tierNumber: number, field: 'revenue_multiplier' | 'rate_reduction', value: number) => {
    setScaleTiers(prev => {
      const updated = prev.map(tier =>
        tier.tier_number === tierNumber ? { ...tier, [field]: value } : tier
      );
      
      // Get base values from Scale config
      const scaleConfig = tiersConfig.find(c => c.tier_type === 'scale');
      const baseRevenue = scaleConfig?.base_revenue_threshold ?? 1000000;
      const baseTakeRate = scaleConfig?.revenue_percentage ?? 0.015;
      
      // Recalculate all tiers
      return recalculateTiers(baseRevenue, baseTakeRate, updated);
    });
  };

  // Update base values and recalculate all tiers
  const updateBaseValues = (field: 'base_revenue_threshold' | 'revenue_percentage', value: number) => {
    updateTierConfig('scale', field, value);
    
    // Recalculate tiers with new base values
    setScaleTiers(prev => {
      const scaleConfig = tiersConfig.find(c => c.tier_type === 'scale');
      const baseRevenue = field === 'base_revenue_threshold' ? value : (scaleConfig?.base_revenue_threshold ?? 1000000);
      const baseTakeRate = field === 'revenue_percentage' ? value : (scaleConfig?.revenue_percentage ?? 0.015);
      
      return recalculateTiers(baseRevenue, baseTakeRate, prev);
    });
  };

  // Recalculate button handler
  const handleRecalculate = () => {
    const scaleConfig = tiersConfig.find(c => c.tier_type === 'scale');
    const baseRevenue = scaleConfig?.base_revenue_threshold ?? 1000000;
    const baseTakeRate = scaleConfig?.revenue_percentage ?? 0.015;
    
    setScaleTiers(prev => recalculateTiers(baseRevenue, baseTakeRate, prev));
    toast.success('Tiers recalculated based on multipliers');
  };

  const saveTierConfig = async (tierType: 'launch' | 'scale') => {
    setIsSaving(true);
    try {
      const config = tiersConfig.find(c => c.tier_type === tierType);
      if (!config) return;

      const updateData: Record<string, any> = {
        fixed_monthly_cost: config.fixed_monthly_cost,
        per_department_cost: config.per_department_cost,
        revenue_percentage: config.revenue_percentage,
        name: config.name,
        description: config.description,
        is_active: config.is_active
      };

      // Include base_revenue_threshold for Scale tier
      if (tierType === 'scale' && config.base_revenue_threshold !== undefined) {
        updateData.base_revenue_threshold = config.base_revenue_threshold;
      }

      const { error } = await supabase
        .from('pricing_tiers_config')
        .update(updateData)
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
            take_rate: tier.take_rate,
            revenue_multiplier: tier.revenue_multiplier,
            rate_reduction: tier.rate_reduction
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

                {/* Base Values for Tier Calculations */}
                <div className="p-4 rounded-lg bg-muted/50 border space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calculator className="w-4 h-4" />
                    Base Values for Tier Calculations
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="base-revenue">Base Revenue Threshold (Tier 1)</Label>
                      <Input
                        id="base-revenue"
                        type="number"
                        value={scaleConfig.base_revenue_threshold ?? 1000000}
                        onChange={(e) => updateBaseValues('base_revenue_threshold', parseFloat(e.target.value) || 1000000)}
                      />
                      <p className="text-xs text-muted-foreground">Starting point: {formatCurrency(scaleConfig.base_revenue_threshold ?? 1000000)}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="base-rate">Base Take Rate (Tier 1)</Label>
                      <Input
                        id="base-rate"
                        type="number"
                        step="0.001"
                        value={scaleConfig.revenue_percentage}
                        onChange={(e) => updateBaseValues('revenue_percentage', parseFloat(e.target.value) || 0.015)}
                      />
                      <p className="text-xs text-muted-foreground">Starting rate: {formatPercentage(scaleConfig.revenue_percentage)}</p>
                    </div>
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Edit multipliers and rate reductions. Revenue thresholds and take rates are calculated automatically.
              </p>
              <Button variant="outline" size="sm" onClick={handleRecalculate}>
                <Calculator className="w-4 h-4 mr-2" />
                Recalculate All
              </Button>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Tier</TableHead>
                    <TableHead className="w-28">Multiplier</TableHead>
                    <TableHead className="w-28">Rate Reduction</TableHead>
                    <TableHead className="text-right">→ Revenue Threshold</TableHead>
                    <TableHead className="text-right">→ Take Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scaleTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.tier_number}</TableCell>
                      <TableCell>
                        {tier.tier_number === 1 ? (
                          <span className="text-muted-foreground">— (base)</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">×</span>
                            <Input
                              type="number"
                              step="0.05"
                              className="w-20"
                              value={tier.revenue_multiplier ?? 1.5}
                              onChange={(e) => updateScaleTierConfig(tier.tier_number, 'revenue_multiplier', parseFloat(e.target.value) || 1.5)}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {tier.tier_number === 1 ? (
                          <span className="text-muted-foreground">— (base)</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">−</span>
                            <Input
                              type="number"
                              step="0.0001"
                              className="w-24"
                              value={tier.rate_reduction ?? 0.0005}
                              onChange={(e) => updateScaleTierConfig(tier.tier_number, 'rate_reduction', parseFloat(e.target.value) || 0.0005)}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(tier.revenue_threshold)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        {formatPercentage(tier.take_rate)}
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
