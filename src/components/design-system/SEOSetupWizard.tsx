import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SEOSetupWizardProps {
  totalPages: number;
  totalLanguages: number;
  requiredEntries: number;
  completedEntries: number;
  averageQuality: number | null;
  onGenerateAllPageMeta: () => void;
  onGenerateSitemap: () => void;
  isGenerating: boolean;
}

export default function SEOSetupWizard({
  totalPages,
  totalLanguages,
  requiredEntries,
  completedEntries,
  averageQuality,
  onGenerateAllPageMeta,
  onGenerateSitemap,
  isGenerating
}: SEOSetupWizardProps) {
  const step1Complete = completedEntries >= requiredEntries;
  const step2Complete = step1Complete && averageQuality && averageQuality >= 70;
  const step3Complete = step2Complete; // Can approve after generation

  const completionPercentage = Math.round((completedEntries / requiredEntries) * 100);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 SEO Setup Wizard
          <Badge variant={step3Complete ? "default" : "secondary"}>
            {completionPercentage}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="text-2xl font-bold">{totalPages}</div>
            <div className="text-sm text-muted-foreground">Published Pages</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalLanguages}</div>
            <div className="text-sm text-muted-foreground">Languages</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {completedEntries}/{requiredEntries}
            </div>
            <div className="text-sm text-muted-foreground">Meta Entries</div>
          </div>
        </div>

        {/* Step 1: Create Page Meta */}
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-lg border-2 transition-all",
          step1Complete 
            ? "border-green-500/30 bg-green-500/5" 
            : "border-primary/30 bg-primary/5"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            step1Complete 
              ? "bg-green-500 text-white" 
              : "bg-primary text-primary-foreground"
          )}>
            {step1Complete ? <Check className="w-5 h-5" /> : "1"}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Create Page Meta Entries</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {step1Complete 
                ? `✓ All ${requiredEntries} page meta entries created!` 
                : `Create meta entries for all ${totalPages} pages across ${totalLanguages} languages (${requiredEntries} total entries)`
              }
            </p>
            {!step1Complete && (
              <Button 
                onClick={onGenerateAllPageMeta}
                disabled={isGenerating}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Auto-Generate All ${requiredEntries} Page Meta Entries`
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Step 2: Generate Meta Descriptions */}
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-lg border-2 transition-all",
          step2Complete 
            ? "border-green-500/30 bg-green-500/5" 
            : step1Complete
              ? "border-primary/30 bg-primary/5"
              : "border-muted bg-muted/20 opacity-60"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            step2Complete 
              ? "bg-green-500 text-white" 
              : step1Complete
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          )}>
            {step2Complete ? <Check className="w-5 h-5" /> : "2"}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Generate Meta Descriptions</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {step2Complete 
                ? `✓ Meta descriptions generated (Avg Quality: ${averageQuality}%)` 
                : step1Complete
                  ? "Use AI to generate optimized meta descriptions for each page/language"
                  : "Complete Step 1 first"
              }
            </p>
            {step1Complete && !step2Complete && (
              <p className="text-xs text-muted-foreground">
                Use the "AI Generate" button on each language tab
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Review & Approve */}
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-lg border-2 transition-all",
          step3Complete 
            ? "border-green-500/30 bg-green-500/5" 
            : step2Complete
              ? "border-primary/30 bg-primary/5"
              : "border-muted bg-muted/20 opacity-60"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            step3Complete 
              ? "bg-green-500 text-white" 
              : step2Complete
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          )}>
            {step3Complete ? <Check className="w-5 h-5" /> : "3"}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Review & Approve</h3>
            <p className="text-sm text-muted-foreground">
              {step3Complete 
                ? "✓ Meta entries reviewed and ready" 
                : step2Complete
                  ? "Review quality scores and approve high-quality meta entries"
                  : "Complete Step 2 first"
              }
            </p>
          </div>
        </div>

        {/* Step 4: Generate Sitemap */}
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-lg border-2 transition-all",
          step3Complete
            ? "border-primary/30 bg-primary/5"
            : "border-muted bg-muted/20 opacity-60"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            step3Complete
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            4
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Generate Sitemap</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {step3Complete 
                ? "Ready to generate sitemap.xml with hreflang alternates" 
                : "Complete Steps 1-3 first"
              }
            </p>
            {step3Complete && (
              <Button onClick={onGenerateSitemap} size="sm" variant="default">
                Generate Sitemap →
              </Button>
            )}
          </div>
        </div>

        {/* Step 5: Submit to Google */}
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-lg border-2",
          "border-muted bg-muted/20"
        )}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
            5
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Submit to Google Search Console</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Upload sitemap.xml to your domain root and submit to Google
            </p>
            <Button size="sm" variant="outline" asChild>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-2" />
                Open Google Search Console
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
