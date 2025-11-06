import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function SitemapGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  async function handleGenerateSitemap() {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-sitemap');

      if (error) throw error;

      // Create a blob and download
      const blob = new Blob([data], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitemap-${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastGenerated(new Date().toLocaleString());
      toast({ 
        title: 'Sitemap generated successfully',
        description: 'Download started automatically'
      });
    } catch (error: any) {
      console.error('Error generating sitemap:', error);
      toast({ 
        title: 'Failed to generate sitemap', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Multilingual Sitemap Generator
            </CardTitle>
            <CardDescription className="mt-2">
              Generate a comprehensive sitemap.xml with hreflang alternates for all pages and languages
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">What's included:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ All published pages across all enabled languages</li>
            <li>✓ Proper hreflang alternates for multilingual SEO</li>
            <li>✓ x-default tags pointing to English versions</li>
            <li>✓ Last modification dates and priorities</li>
          </ul>
        </div>

        {lastGenerated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Last generated: {lastGenerated}
          </div>
        )}

        <div className="flex gap-2">
...
        </div>

        <div className="p-3 bg-info/10 border border-info/20 rounded-md">
          <p className="text-xs text-info dark:text-info/80">
            <strong>Deployment tip:</strong> Upload the generated sitemap.xml to your domain root and submit it to Google Search Console for optimal indexing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
