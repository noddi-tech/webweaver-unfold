import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import CarouselManager from "@/components/design-system/CarouselManager";
import VideoManager from "@/components/design-system/VideoManager";
import FeaturesManager from "@/components/design-system/FeaturesManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EditableTypographySystem } from "@/components/design-system/EditableTypographySystem";
import { ColorPaletteTab } from "@/components/design-system/ColorPaletteTab";
import { EditableComponentLibrary } from "@/components/design-system/EditableComponentLibrary";
import { EditableSpacingSystem } from "@/components/design-system/EditableSpacingSystem";
import { IconLibrary } from "@/components/design-system/IconLibrary";
import USPCms from "@/components/design-system/USPCms";
import LogoManager from "@/components/design-system/LogoManager";
import ImageManager from "@/components/design-system/ImageManager";
import EmployeesManager from "@/components/design-system/EmployeesManager";
import SolutionsManager from "@/components/design-system/SolutionsManager";
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
import { FAQManager } from "@/components/design-system/FAQManager";
import TranslationManagerContent from "@/components/design-system/TranslationManagerContent";
import PageMetaManager from "@/components/design-system/PageMetaManager";
import SitemapGenerator from "@/components/design-system/SitemapGenerator";
import UnifiedDashboard from "@/components/design-system/UnifiedDashboard";
import SEOSetupWizard from "@/components/design-system/SEOSetupWizard";
import EvaluationHealthDashboard from "@/components/design-system/EvaluationHealthDashboard";
import { RotatingTermsManager } from "@/components/design-system/RotatingTermsManager";
import StoriesManager from "@/components/design-system/StoriesManager";
import BlogManager from "@/components/design-system/BlogManager";
import JobsManager from "@/components/design-system/JobsManager";
import NewsletterManager from "@/components/design-system/NewsletterManager";
import { PressManager } from "@/components/design-system/PressManager";
import TechStackManager from "@/components/design-system/TechStackManager";
import ApplicationsManager from "@/components/design-system/ApplicationsManager";
import { EmailTemplatesManager } from "@/components/design-system/EmailTemplatesManager";
import InboxManager from "@/components/design-system/InboxManager";
import InterviewScheduler from "@/components/design-system/InterviewScheduler";
import EvaluationCriteriaManager from "@/components/design-system/EvaluationCriteriaManager";
import { HiringAnalytics } from "@/components/design-system/HiringAnalytics";
import { CandidatePipeline } from "@/components/design-system/CandidatePipeline";

const Admin = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const { isAdmin, loading: roleLoading } = useUserRole();

  // URL parameter support for direct navigation (e.g., ?section=applications)
  const sectionParam = searchParams.get("section");
  const getDefaultTabs = () => {
    // Career section tabs
    const careerTabs = ["applications", "pipeline", "inbox", "interviews", "analytics", "jobs", "emails", "settings"];
    if (sectionParam && careerTabs.includes(sectionParam)) {
      return { main: "career", career: sectionParam };
    }
    return { main: "cms", cms: "content", config: "header", career: "applications" };
  };
  const defaults = getDefaultTabs();

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

  if (authenticated === null || roleLoading) {
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

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>
                You don't have permission to access the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Only users with admin privileges can access this area. If you believe you should have access, please contact your administrator.
              </p>
              <Button onClick={() => window.location.href = "/"} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold gradient-text">Admin</h1>
        </div>

        <Tabs defaultValue={defaults.main} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-12">
            <TabsTrigger value="cms">CMS</TabsTrigger>
            <TabsTrigger value="translations">Translations & SEO</TabsTrigger>
            <TabsTrigger value="design">Design System</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
          </TabsList>

          {/* CMS Section with nested tabs */}
          <TabsContent value="cms" className="space-y-8">
            <Tabs defaultValue={defaults.cms} className="w-full">
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
                    <TabsTrigger value="rotating">Rotating Headlines</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="solutions">Solutions</TabsTrigger>
                    <TabsTrigger value="stories">Stories</TabsTrigger>
                    <TabsTrigger value="blog">Blog</TabsTrigger>
                    <TabsTrigger value="press">Press</TabsTrigger>
                    <TabsTrigger value="usps">USPs</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
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
                  <TabsContent value="rotating" className="space-y-8">
                    <RotatingTermsManager />
                  </TabsContent>
                  <TabsContent value="features" className="space-y-8">
                    <FeaturesManager />
                  </TabsContent>
                  <TabsContent value="solutions" className="space-y-8">
                    <SolutionsManager />
                  </TabsContent>
                  <TabsContent value="stories" className="space-y-8">
                    <StoriesManager />
                  </TabsContent>
                  <TabsContent value="blog" className="space-y-8">
                    <BlogManager />
                  </TabsContent>
                  <TabsContent value="press" className="space-y-8">
                    <PressManager />
                  </TabsContent>
                  <TabsContent value="usps" className="space-y-8">
                    <USPCms />
                  </TabsContent>
                  <TabsContent value="contact" className="space-y-8">
                    <ContactManager />
                  </TabsContent>
                  <TabsContent value="faqs" className="space-y-8">
                    <FAQManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Media Assets Tab */}
  <TabsContent value="media">
                <Tabs defaultValue="images">
                  <TabsList className="flex flex-wrap gap-2 mb-6">
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="carousels">Carousels</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="favicon">Favicon</TabsTrigger>
                  </TabsList>
                  <TabsContent value="images" className="space-y-8">
                    <ImageManager />
                  </TabsContent>
                  <TabsContent value="carousels" className="space-y-8">
                    <CarouselManager />
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
                <Tabs defaultValue={defaults.config}>
                  <TabsList className="flex flex-wrap gap-2 mb-6">
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="footer">Footer</TabsTrigger>
                    <TabsTrigger value="social">Social Meta</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="employees">Team</TabsTrigger>
                    <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                    <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
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
                  <TabsContent value="newsletter" className="space-y-8">
                    <NewsletterManager />
                  </TabsContent>
                  <TabsContent value="techstack" className="space-y-8">
                    <TechStackManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Career Section */}
          <TabsContent value="career" className="space-y-8">
            <Tabs defaultValue={defaults.career} className="w-full">
              <TabsList className="grid w-full grid-cols-8 mb-8">
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="emails">Email Templates</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-8">
                <ApplicationsManager />
              </TabsContent>

              <TabsContent value="pipeline" className="space-y-8">
                <CandidatePipeline />
              </TabsContent>

              <TabsContent value="inbox" className="space-y-8">
                <InboxManager />
              </TabsContent>

              <TabsContent value="interviews" className="space-y-8">
                <InterviewScheduler />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <HiringAnalytics />
              </TabsContent>

              <TabsContent value="jobs" className="space-y-8">
                <JobsManager />
              </TabsContent>

              <TabsContent value="emails" className="space-y-8">
                <EmailTemplatesManager />
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                <EvaluationCriteriaManager />
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

              <TabsContent value="overview" className="space-y-6">
                <UnifiedDashboard />
                <EvaluationHealthDashboard />
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
                <div>
                  <h2 className="text-3xl font-bold mb-4">Colors & Design System</h2>
                  <p className="text-muted-foreground mb-6">
                    Single source of truth for all brand colors. All colors are managed in the database and instantly available across the entire website.
                  </p>
                  <ColorPaletteTab />
                </div>
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
              href="https://github.com/yourusername/navio/blob/main/content/design-system/README.md" 
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
