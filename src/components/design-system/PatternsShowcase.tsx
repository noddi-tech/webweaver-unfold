import React from "react";
import HeroGradient from "@/components/patterns/HeroGradient";
import FeatureCardGradient from "@/components/patterns/FeatureCardGradient";
import DashboardOverview from "@/components/patterns/DashboardOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const codeHero = `<HeroGradient title="Build faster with beautiful gradients" subtitle="Use semantic gradient tokens for consistent brand visuals." ctaText="Get Started" />`;
const codeFeature = `<FeatureCardGradient title="Zero config" description="Prewired tokens and gradients for instant theming." iconName="Sparkles" />`;
const codeDashboard = `<DashboardOverview />`;

const PatternsShowcase: React.FC = () => {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Pattern Components</h2>
        <p className="text-muted-foreground">Reusable section-level components built with existing tokens.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HeroGradient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <HeroGradient />
          <pre className="p-3 rounded-md bg-muted text-sm overflow-auto"><code>{codeHero}</code></pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FeatureCardGradient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCardGradient />
            <FeatureCardGradient title="Secure by default" iconName="Shield" />
            <FeatureCardGradient title="Beautiful UI" iconName="Palette" />
          </div>
          <pre className="p-3 rounded-md bg-muted text-sm overflow-auto"><code>{codeFeature}</code></pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DashboardOverview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DashboardOverview />
          <pre className="p-3 rounded-md bg-muted text-sm overflow-auto"><code>{codeDashboard}</code></pre>
        </CardContent>
      </Card>
    </section>
  );
};

export default PatternsShowcase;
