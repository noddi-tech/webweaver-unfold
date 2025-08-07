import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableDesignTokens } from "@/components/design-system/EditableDesignTokens";
import { EditableColorSystem } from "@/components/design-system/EditableColorSystem";
import { EditableTypographySystem } from "@/components/design-system/EditableTypographySystem";
import { EditableComponentLibrary } from "@/components/design-system/EditableComponentLibrary";
import { EditableSpacingSystem } from "@/components/design-system/EditableSpacingSystem";
import { IconLibrary } from "@/components/design-system/IconLibrary";
import VideoManager from "@/components/design-system/VideoManager";

const DesignSystem = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Noddi Tech Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The single source of truth for all design tokens, components, and patterns.
            This living documentation ensures consistency across our entire platform.
          </p>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-12">
            <TabsTrigger value="colors">Colors & Tokens</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
            <TabsTrigger value="videos">Demo Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-8">
            <EditableColorSystem />
          </TabsContent>

          <TabsContent value="typography" className="space-y-8">
            <EditableTypographySystem />
          </TabsContent>

          <TabsContent value="spacing" className="space-y-8">
            <EditableSpacingSystem />
          </TabsContent>

          <TabsContent value="components" className="space-y-8">
            <EditableComponentLibrary />
          </TabsContent>

          <TabsContent value="icons" className="space-y-8">
            <IconLibrary />
          </TabsContent>

          <TabsContent value="videos" className="space-y-8">
            <VideoManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DesignSystem;