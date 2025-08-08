import React from "react";

const HeroGradient: React.FC<{ title?: string; subtitle?: string; ctaText?: string }> = ({
  title = "Build faster with beautiful gradients",
  subtitle = "Use semantic gradient tokens for consistent brand visuals.",
  ctaText = "Get Started",
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border p-10 bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-70" aria-hidden="true" />
      <div className="relative z-10 space-y-4">
        <h2 className="text-4xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">{subtitle}</p>
        <button className="inline-flex items-center px-5 py-2 rounded-md bg-primary text-primary-foreground">
          {ctaText}
        </button>
      </div>
    </section>
  );
};

export default HeroGradient;
