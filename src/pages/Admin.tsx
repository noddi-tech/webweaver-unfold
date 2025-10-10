import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import VideoManager from "@/components/design-system/VideoManager";
import FeaturesManager from "@/components/design-system/FeaturesManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EditableColorSystem } from "@/components/design-system/EditableColorSystem";
import { EditableTypographySystem } from "@/components/design-system/EditableTypographySystem";
import { EditableComponentLibrary } from "@/components/design-system/EditableComponentLibrary";
import { EditableSpacingSystem } from "@/components/design-system/EditableSpacingSystem";
import { IconLibrary } from "@/components/design-system/IconLibrary";
import USPCms from "@/components/design-system/USPCms";
import LogoManager from "@/components/design-system/LogoManager";
import ImageManager from "@/components/design-system/ImageManager";
import EmployeesManager from "@/components/design-system/EmployeesManager";
import TextContentManager from "@/components/design-system/TextContentManager";
import ContactManager from "@/components/design-system/ContactManager";
import SectionsManager from "@/components/design-system/SectionsManager";
import HeaderManager from "@/components/design-system/HeaderManager";
import FooterManager from "@/components/design-system/FooterManager";
import { PagesManager } from "@/components/design-system/PagesManager";
import FileManager from "@/components/design-system/FileManager";
import FaviconManager from "@/components/design-system/FaviconManager";
import SocialMetaManager from "@/components/design-system/SocialMetaManager";
import PricingManager from "@/components/design-system/PricingManager";
import TranslationManagerContent from "@/components/design-system/TranslationManagerContent";
import PageMetaManager from "@/components/design-system/PageMetaManager";
import SitemapGenerator from "@/components/design-system/SitemapGenerator";
import UnifiedDashboard from "@/components/design-system/UnifiedDashboard";
import SEOSetupWizard from "@/components/design-system/SEOSetupWizard";

const Admin = () => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Admin";
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });
    supabase.auth.getSession().then(({ data }) => setAuthenticated(!!data.session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      window.location.href = "/cms-login";
    } catch (err: any) {
      toast({ title: "Sign out failed", description: err.message, variant: "destructive" });
    }
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-20 px-6">
          <div className="container mx-auto">
            <p className="text-center text-muted-foreground">Checking authentication…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!authenticated) {
    window.location.href = "/auth";
    return null;
  }

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold gradient-text">Admin</h1>
        </div>

        <Tabs defaultValue="cms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="cms">CMS</TabsTrigger>
            <TabsTrigger value="translations">Translations & SEO</TabsTrigger>
            <TabsTrigger value="design">Design System</TabsTrigger>
          </TabsList>

          {/* CMS Section with nested tabs */}
          <TabsContent value="cms" className="space-y-8">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="content">Content Management</TabsTrigger>
                <TabsTrigger value="media">Media Assets</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>

              {/* Content Management Tab */}
              <TabsContent value="content">
                <Tabs defaultValue="pages">
                  <TabsList className="flex flex-wrap gap-2 mb-6">
                    <TabsTrigger value="pages">Pages</TabsTrigger>
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="text">Text Content</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="usps">USPs</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pages" className="space-y-8">
                    <PagesManager />
                  </TabsContent>
                  <TabsContent value="sections" className="space-y-8">
                    <SectionsManager />
                  </TabsContent>
                  <TabsContent value="text" className="space-y-8">
                    <TextContentManager />
                  </TabsContent>
                  <TabsContent value="features" className="space-y-8">
                    <FeaturesManager />
                  </TabsContent>
                  <TabsContent value="usps" className="space-y-8">
                    <USPCms />
                  </TabsContent>
                  <TabsContent value="contact" className="space-y-8">
                    <ContactManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Media Assets Tab */}
              <TabsContent value="media">
                <Tabs defaultValue="images">
                  <TabsList className="flex flex-wrap gap-2 mb-6">
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="favicon">Favicon</TabsTrigger>
                  </TabsList>
                  <TabsContent value="images" className="space-y-8">
                    <ImageManager />
                  </TabsContent>
                  <TabsContent value="videos" className="space-y-8">
                    <VideoManager />
                  </TabsContent>
                  <TabsContent value="files" className="space-y-8">
                    <FileManager />
                  </TabsContent>
                  <TabsContent value="favicon" className="space-y-8">
                    <FaviconManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config">
                <Tabs defaultValue="header">
                  <TabsList className="flex flex-wrap gap-2 mb-6">
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="footer">Footer</TabsTrigger>
                    <TabsTrigger value="social">Social Meta</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="employees">Team</TabsTrigger>
                  </TabsList>
                  <TabsContent value="header" className="space-y-8">
                    <HeaderManager />
                  </TabsContent>
                  <TabsContent value="footer" className="space-y-8">
                    <FooterManager />
                  </TabsContent>
                  <TabsContent value="social" className="space-y-8">
                    <SocialMetaManager />
                  </TabsContent>
                  <TabsContent value="pricing" className="space-y-8">
                    <PricingManager />
                  </TabsContent>
                  <TabsContent value="employees" className="space-y-8">
                    <EmployeesManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Translations & SEO Section */}
          <TabsContent value="translations" className="space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview">📊 Overview</TabsTrigger>
                <TabsTrigger value="translations">🌍 Translations</TabsTrigger>
                <TabsTrigger value="seo">🚀 SEO & Meta</TabsTrigger>
                <TabsTrigger value="sitemap">🗺️ Sitemap</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <UnifiedDashboard />
              </TabsContent>

              <TabsContent value="translations">
                <TranslationManagerContent />
              </TabsContent>

              <TabsContent value="seo">
                <PageMetaManager />
              </TabsContent>

              <TabsContent value="sitemap">
                <SitemapGenerator />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Design System Section with nested tabs */}
          <TabsContent value="design" className="space-y-8">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger value="colors">Colors & Tokens</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="spacing">Spacing</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="icons">Icons</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
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

              <TabsContent value="logo" className="space-y-8">
                <LogoManager />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">
              All tools are now consolidated under /cms. Any signed-in user can edit.
            </p>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Design System Docs
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Learn about color tokens, spacing, and accessibility guidelines.
            </p>
            <a 
              href="https://github.com/yourusername/noddi-tech/blob/main/content/design-system/README.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View Documentation →
            </a>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
