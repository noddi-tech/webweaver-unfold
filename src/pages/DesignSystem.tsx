import Header from "@/components/Header";
import { DesignTokens } from "@/components/design-system/DesignTokens";
import { TypographySystem } from "@/components/design-system/TypographySystem";
import { ColorSystem } from "@/components/design-system/ColorSystem";
import { ComponentLibrary } from "@/components/design-system/ComponentLibrary";
import { SpacingSystem } from "@/components/design-system/SpacingSystem";
import { IconLibrary } from "@/components/design-system/IconLibrary";

const DesignSystem = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Noddi Tech Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The single source of truth for all design tokens, components, and patterns. 
            This living documentation ensures consistency across our entire platform.
          </p>
        </div>

        <div className="space-y-24">
          <DesignTokens />
          <ColorSystem />
          <TypographySystem />
          <SpacingSystem />
          <ComponentLibrary />
          <IconLibrary />
        </div>
      </main>
    </div>
  );
};

export default DesignSystem;