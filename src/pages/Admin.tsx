import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";
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
import HeadingManager from "@/components/design-system/HeadingManager";
import ContactManager from "@/components/design-system/ContactManager";
import SectionsManager from "@/components/design-system/SectionsManager";
import HeaderManager from "@/components/design-system/HeaderManager";
import FooterManager from "@/components/design-system/FooterManager";
import { PagesManager } from "@/components/design-system/PagesManager";
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
      window.location.href = "/auth";
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
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="cms">CMS</TabsTrigger>
            <TabsTrigger value="design">Design System</TabsTrigger>
          </TabsList>

          {/* CMS Section with nested tabs */}
          <TabsContent value="cms" className="space-y-8">
            <Tabs defaultValue="pages" className="w-full">
               <TabsList className="flex w-full flex-wrap gap-2 h-auto mb-8 justify-center">
                <TabsTrigger value="pages">Pages CMS</TabsTrigger>
                <TabsTrigger value="sections">Sections CMS</TabsTrigger>
                <TabsTrigger value="header">Header CMS</TabsTrigger>
                <TabsTrigger value="footer">Footer CMS</TabsTrigger>
                <TabsTrigger value="videos">Videos CMS</TabsTrigger>
                <TabsTrigger value="images">Images CMS</TabsTrigger>
                <TabsTrigger value="features">Features CMS</TabsTrigger>
                <TabsTrigger value="usps">USPs CMS</TabsTrigger>
                <TabsTrigger value="employees">Employees CMS</TabsTrigger>
                <TabsTrigger value="headings">Heading CMS</TabsTrigger>
                <TabsTrigger value="contact">Contact CMS</TabsTrigger>
              </TabsList>
              <TabsContent value="pages" className="space-y-8">
                <PagesManager />
              </TabsContent>
              <TabsContent value="sections" className="space-y-8">
                <SectionsManager />
              </TabsContent>
              <TabsContent value="header" className="space-y-8">
                <HeaderManager />
              </TabsContent>
              <TabsContent value="footer" className="space-y-8">
                <FooterManager />
              </TabsContent>
              <TabsContent value="videos" className="space-y-8">
                <VideoManager />
              </TabsContent>
              <TabsContent value="images" className="space-y-8">
                <ImageManager />
              </TabsContent>
              <TabsContent value="features" className="space-y-8">
                <FeaturesManager />
              </TabsContent>
              <TabsContent value="usps" className="space-y-8">
                <USPCms />
              </TabsContent>
              <TabsContent value="employees" className="space-y-8">
                <EmployeesManager />
              </TabsContent>
              <TabsContent value="headings" className="space-y-8">
                <HeadingManager />
              </TabsContent>
              <TabsContent value="contact" className="space-y-8">
                <ContactManager />
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

        <Card className="mt-8 p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground">All tools are now consolidated under /admin. Any signed-in user can edit.</p>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
