import { icons } from "lucide-react";

export interface BrandLogoSettings {
  logo_text: string;
  gradient_token: string;
  text_token: string;
  logo_image_url: string | null;
  logo_variant: string;
  logo_image_height: number;
  logo_icon_name: string | null;
  logo_icon_position: string;
  logo_icon_size: string;
}

interface BrandLogoProps {
  brand: BrandLogoSettings;
}

const gradientClassMap: Record<string, string> = {
  "gradient-primary": "bg-gradient-primary",
  "gradient-background": "bg-gradient-background",
  "gradient-hero": "bg-gradient-hero",
};

const iconSizeMap: Record<string, number> = {
  small: 16,
  default: 24,
  medium: 28,
  large: 32,
  xl: 40,
};

const iconPositionMap: Record<string, string> = {
  "top-right": "top-0 -translate-y-1/2",
  "middle-right": "top-1/2 -translate-y-1/2",
  "bottom-right": "bottom-0 translate-y-1/2",
};

export function BrandLogo({ brand }: BrandLogoProps) {
  if (brand.logo_variant === "image" && brand.logo_image_url) {
    return (
      <img
        src={brand.logo_image_url}
        alt={brand.logo_text || "Brand logo"}
        className="w-auto"
        style={{ height: brand.logo_image_height || 32 }}
      />
    );
  }

  const Icon = brand.logo_icon_name
    ? (icons as Record<string, any>)[brand.logo_icon_name]
    : null;
  const iconSize = iconSizeMap[brand.logo_icon_size || "default"] ?? 24;
  const iconPosition = iconPositionMap[brand.logo_icon_position] ?? "top-0 -translate-y-1/2";

  return (
    <span
      className={`${gradientClassMap[brand.gradient_token] || "bg-gradient-primary"} bg-clip-text text-transparent relative inline-block`}
      style={{ paddingRight: brand.logo_icon_name ? iconSize + 4 : undefined }}
    >
      {brand.logo_text}
      {Icon ? (
        <Icon
          className={`absolute right-0 ${iconPosition} bg-gradient-primary bg-clip-text text-transparent`}
          style={{ width: iconSize, height: iconSize }}
        />
      ) : null}
    </span>
  );
}
