import React from "react";
import { icons } from "lucide-react";

export interface FeaturePreviewSettings {
  background_token?: string;
  card_bg_token?: string;
  border_token?: string;
  icon_token?: string;
  title_token?: string;
  description_token?: string;
}

interface FeaturePreviewProps {
  title?: string;
  description?: string | null;
  iconName?: string;
  settings?: FeaturePreviewSettings | null;
}

const bgClass: Record<string, string> = {
  background: "bg-background",
  card: "bg-card",
  "gradient-primary": "bg-gradient-primary",
  "gradient-background": "bg-gradient-background",
  "gradient-hero": "bg-gradient-hero",
};

const textClass: Record<string, string> = {
  foreground: "text-foreground",
  "muted-foreground": "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  "gradient-primary": "bg-gradient-primary bg-clip-text text-transparent",
  "gradient-background": "bg-gradient-background bg-clip-text text-transparent",
  "gradient-hero": "bg-gradient-hero bg-clip-text text-transparent",
};

const borderClass: Record<string, string> = {
  border: "border-border",
};

const FeaturePreview: React.FC<FeaturePreviewProps> = ({
  title,
  description,
  iconName = "Sparkles",
  settings,
}) => {
  const LucideIcon = (icons as Record<string, React.ComponentType<any>>)[iconName] ||
    (icons as Record<string, React.ComponentType<any>>)["Sparkles"];

  const cardBg = bgClass[settings?.card_bg_token || "card"] || "bg-card";
  const borderClr = borderClass[settings?.border_token || "border"] || "border-border";
  const iconClr = textClass[settings?.icon_token || "primary"] || "text-primary";
  const titleClr = textClass[settings?.title_token || "foreground"] || "text-foreground";
  const descClr = textClass[settings?.description_token || "muted-foreground"] || "text-muted-foreground";

  return (
    <div className={`rounded-xl border ${borderClr} ${cardBg} p-5 shadow-sm w-full max-w-sm`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-muted/30 mb-4`}>
        {LucideIcon ? <LucideIcon className={`w-6 h-6 ${iconClr}`} /> : null}
      </div>
      <h4 className={`text-lg font-semibold ${titleClr}`}>
        {title && title.trim().length > 0 ? title : "Feature title"}
      </h4>
      <p className={`text-sm mt-1 ${descClr}`}>
        {description && description.trim().length > 0 ? description : "Short description to explain the value."}
      </p>
    </div>
  );
};

export default FeaturePreview;
