import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, MoveUp, MoveDown, Save } from "lucide-react";

interface PricingPlan {
  id?: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  cta_text: string;
  cta_url?: string;
  active: boolean;
  sort_order: number;
}

const PricingManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setPlans((data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features.filter((f): f is string => typeof f === 'string')
          : []
      })));
    } catch (error: any) {
      toast({
        title: "Error fetching pricing plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePlans = async () => {
    try {
      // Delete plans that don't have an id (not yet created) but are marked as inactive
      const plansToSave = plans.filter(plan => plan.id || plan.active);

      for (const plan of plansToSave) {
        if (plan.id) {
          const { error } = await supabase
            .from("pricing_plans")
            .update({
              name: plan.name,
              price: plan.price,
              period: plan.period,
              description: plan.description,
              features: plan.features,
              popular: plan.popular,
              cta_text: plan.cta_text,
              cta_url: plan.cta_url,
              active: plan.active,
              sort_order: plan.sort_order,
            })
            .eq("id", plan.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("pricing_plans").insert({
            name: plan.name,
            price: plan.price,
            period: plan.period,
            description: plan.description,
            features: plan.features,
            popular: plan.popular,
            cta_text: plan.cta_text,
            cta_url: plan.cta_url,
            active: plan.active,
            sort_order: plan.sort_order,
          });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Pricing plans saved successfully",
      });

      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Error saving pricing plans",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addPlan = () => {
    setPlans([
      ...plans,
      {
        name: "New Plan",
        price: "$0",
        period: "/month",
        description: "",
        features: ["Feature 1"],
        popular: false,
        cta_text: "Get Started",
        cta_url: "",
        active: true,
        sort_order: plans.length,
      },
    ]);
  };

  const updatePlan = (index: number, field: keyof PricingPlan, value: any) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    setPlans(updated);
  };

  const addFeature = (planIndex: number) => {
    const updated = [...plans];
    updated[planIndex].features.push("");
    setPlans(updated);
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const updated = [...plans];
    updated[planIndex].features[featureIndex] = value;
    setPlans(updated);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const updated = [...plans];
    updated[planIndex].features.splice(featureIndex, 1);
    setPlans(updated);
  };

  const removePlan = async (index: number) => {
    const plan = plans[index];
    if (plan.id) {
      try {
        const { error } = await supabase
          .from("pricing_plans")
          .delete()
          .eq("id", plan.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Pricing plan deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error deleting plan",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    const updated = [...plans];
    updated.splice(index, 1);
    setPlans(updated);
  };

  const movePlan = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === plans.length - 1)
    )
      return;

    const updated = [...plans];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    updated.forEach((plan, idx) => {
      plan.sort_order = idx;
    });

    setPlans(updated);
  };

  if (loading) {
    return (
      <Card className="bg-background text-foreground">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading pricing plans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background text-foreground">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pricing Plans Manager
          <Button onClick={addPlan} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {plans.map((plan, planIndex) => (
          <Card key={plan.id || planIndex} className="p-4 bg-background text-foreground">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => movePlan(planIndex, "up")}
                    disabled={planIndex === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => movePlan(planIndex, "down")}
                    disabled={planIndex === plans.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlan(planIndex)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={plan.name}
                    onChange={(e) => updatePlan(planIndex, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    value={plan.price}
                    onChange={(e) => updatePlan(planIndex, "price", e.target.value)}
                    placeholder="$99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period</Label>
                  <Input
                    value={plan.period}
                    onChange={(e) => updatePlan(planIndex, "period", e.target.value)}
                    placeholder="/month"
                  />
                </div>
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    value={plan.cta_text}
                    onChange={(e) => updatePlan(planIndex, "cta_text", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={plan.description}
                  onChange={(e) => updatePlan(planIndex, "description", e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>CTA URL (optional)</Label>
                <Input
                  value={plan.cta_url || ""}
                  onChange={(e) => updatePlan(planIndex, "cta_url", e.target.value)}
                  placeholder="/contact"
                />
              </div>

              <div>
                <Label className="mb-2 block">Features</Label>
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) =>
                          updateFeature(planIndex, featureIndex, e.target.value)
                        }
                        placeholder="Feature description"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(planIndex, featureIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature(planIndex)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.popular}
                    onCheckedChange={(checked) =>
                      updatePlan(planIndex, "popular", checked)
                    }
                  />
                  <Label>Mark as Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.active}
                    onCheckedChange={(checked) =>
                      updatePlan(planIndex, "active", checked)
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Button onClick={savePlans} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save All Plans
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingManager;
