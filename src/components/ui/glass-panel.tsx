import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "sm" | "md" | "lg";
  maxHeight?: number | string;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, elevation = "md", maxHeight, style, ...props }, ref) => {
    const shadow = elevation === "lg" ? "shadow-2xl" : elevation === "sm" ? "shadow" : "shadow-lg";
    return (
      <div
        ref={ref}
        className={cn(
          "backdrop-blur-md border rounded-lg",
          "bg-[hsl(var(--background)/0.6)]",
          "border-border",
          shadow,
          "animate-enter",
          className
        )}
        style={{ maxHeight, ...style }}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
