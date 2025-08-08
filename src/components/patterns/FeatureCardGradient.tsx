import React from "react";
import { icons } from "lucide-react";

const FeatureCardGradient: React.FC<{
  title?: string;
  description?: string;
  iconName?: string;
}> = ({
  title = "Zero config",
  description = "Prewired tokens and gradients for instant theming.",
  iconName = "Sparkles",
}) => {
  const Icon = (icons as Record<string, any>)[iconName];
  return (
    <div className="rounded-xl border border-border p-5 bg-card">
      <div className="w-10 h-10 rounded-md bg-gradient-primary flex items-center justify-center text-card-foreground">
        {Icon ? <Icon className="w-5 h-5" /> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCardGradient;
