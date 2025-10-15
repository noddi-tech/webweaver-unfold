import Header from '@/components/Header';
import TranslationManagerContent from '@/components/design-system/TranslationManagerContent';
import PageMetaManager from '@/components/design-system/PageMetaManager';
import SitemapGenerator from '@/components/design-system/SitemapGenerator';
import UnifiedDashboard from '@/components/design-system/UnifiedDashboard';
import LanguageVisibilityManager from '@/components/design-system/LanguageVisibilityManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslationStats } from '@/hooks/useTranslationStats';

export default function TranslationManager() {
  // Pre-load shared data for both tabs
  useTranslationStats();

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-section">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="translations">🌍 Translations</TabsTrigger>
              <TabsTrigger value="seo">🚀 SEO & Meta</TabsTrigger>
              <TabsTrigger value="sitemap">🗺️ Sitemap</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
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

            <TabsContent value="settings">
              <LanguageVisibilityManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
