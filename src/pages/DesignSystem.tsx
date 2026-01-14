import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableTypographySystem } from "@/components/design-system/EditableTypographySystem";
import { EditableComponentLibrary } from "@/components/design-system/EditableComponentLibrary";
import { EditableSpacingSystem } from "@/components/design-system/EditableSpacingSystem";
import { IconLibrary } from "@/components/design-system/IconLibrary";
import { ButtonShowcase } from "@/components/design-system/ButtonShowcase";
import VideoManager from "@/components/design-system/VideoManager";
import LogoManager from "@/components/design-system/LogoManager";
import USPCms from "@/components/design-system/USPCms";
import PatternsShowcase from "@/components/design-system/PatternsShowcase";
import SectionsManager from "@/components/design-system/SectionsManager";
import { ColorPaletteTab } from "@/components/design-system/ColorPaletteTab";
import FontManager from "@/components/design-system/FontManager";
import BulkCardStyleUpdater from "@/components/design-system/BulkCardStyleUpdater";
import { CardStylePresetPicker } from "@/components/design-system/CardStylePresetPicker";
import EmailAnalyticsDashboard from "@/components/design-system/EmailAnalyticsDashboard";

const DesignSystem = () => {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Navio Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The single source of truth for all design tokens, components, and patterns.
            This living documentation ensures consistency across our entire platform.
          </p>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-14 mb-12">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="cardstyles">Card Styles</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="usps">USPs</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-8">
            <ColorPaletteTab />
          </TabsContent>

          <TabsContent value="fonts" className="space-y-8">
            <FontManager />
          </TabsContent>

          <TabsContent value="typography" className="space-y-8">
            <EditableTypographySystem />
          </TabsContent>

          <TabsContent value="spacing" className="space-y-8">
            <EditableSpacingSystem />
          </TabsContent>

          <TabsContent value="buttons" className="space-y-8">
            <ButtonShowcase />
          </TabsContent>

          <TabsContent value="components" className="space-y-8">
            <EditableComponentLibrary />
          </TabsContent>

          <TabsContent value="cardstyles" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BulkCardStyleUpdater />
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Style Presets</h2>
                <p className="text-muted-foreground">Saved card style combinations for quick application</p>
                <CardStylePresetPicker onApply={() => {}} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="icons" className="space-y-8">
            <IconLibrary />
          </TabsContent>

          <TabsContent value="logo" className="space-y-8">
            <LogoManager />
          </TabsContent>

          <TabsContent value="sections" className="space-y-8">
            <SectionsManager />
          </TabsContent>

          <TabsContent value="usps" className="space-y-8">
            <USPCms />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-8">
            <PatternsShowcase />
          </TabsContent>

          <TabsContent value="videos" className="space-y-8">
            <VideoManager />
          </TabsContent>

          <TabsContent value="emails" className="space-y-8">
            <EmailAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DesignSystem;
