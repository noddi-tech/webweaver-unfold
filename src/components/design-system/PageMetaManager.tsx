import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Sparkles, Loader2, Plus, AlertTriangle, FileText, Zap } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SEOSetupWizard from './SEOSetupWizard';

export default function PageMetaManager() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [pageMetas, setPageMetas] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchFilter, setSearchFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Form state for new/edit meta
  const [formData, setFormData] = useState({
    page_slug: '/',
    language_code: 'en',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image_url: '',
    canonical_url: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: langs }, { data: metas }, { data: pgs }] = await Promise.all([
      supabase.from('languages').select('*').order('sort_order'),
      supabase.from('page_meta_translations' as any).select('*').order('page_slug, language_code'),
      supabase.from('pages').select('slug, title').eq('published', true),
    ]);
    
    if (langs) setLanguages(langs);
    if (metas) setPageMetas(metas);
    if (pgs) setPages(pgs);
  }

  const enabledLanguages = languages.filter(l => l.enabled);
  const totalPages = pages.length;
  const requiredEntries = totalPages * enabledLanguages.length;
  const completedEntries = pageMetas.length;
  
  const avgQuality = pageMetas.length > 0
    ? Math.round(pageMetas.reduce((sum, m) => sum + (m.quality_score || 0), 0) / pageMetas.length)
    : null;

  const filteredMetas = pageMetas.filter(m => {
    if (m.language_code !== selectedLang) return false;
    if (searchFilter && !m.page_slug.toLowerCase().includes(searchFilter.toLowerCase()) && 
        !m.meta_title.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (qualityFilter !== 'all') {
      const score = m.quality_score;
      if (qualityFilter === 'high' && (score === null || score < 85)) return false;
      if (qualityFilter === 'medium' && (score === null || score < 70 || score >= 85)) return false;
      if (qualityFilter === 'low' && (score === null || score >= 70)) return false;
      if (qualityFilter === 'needs_review' && m.review_status !== 'needs_review') return false;
    }
    return true;
  });

  async function handleBulkCreatePageMeta(targetLanguageCode?: string) {
    setIsCreatingBulk(true);
    
    try {
      const targetLanguages = targetLanguageCode 
        ? languages.filter(l => l.code === targetLanguageCode)
        : languages.filter(l => l.enabled);

      if (targetLanguages.length === 0 || pages.length === 0) {
        toast({ title: 'No languages or pages found', variant: 'destructive' });
        return;
      }

      const newEntries = [];
      
      for (const lang of targetLanguages) {
        for (const page of pages) {
          // Normalize slug: homepage -> /, others remain unchanged
          const normalizedSlug = page.slug === 'homepage' ? '/' : page.slug;
          
          // Check if entry already exists
          const exists = pageMetas.some(
            m => m.language_code === lang.code && m.page_slug === normalizedSlug
          );
          
          if (!exists) {
            newEntries.push({
              page_slug: normalizedSlug,
              language_code: lang.code,
              meta_title: page.title || normalizedSlug,
              meta_description: `${page.title} - Description needed`,
              review_status: 'needs_review'
            });
          }
        }
      }

      if (newEntries.length === 0) {
        toast({ title: 'All page meta entries already exist' });
        return;
      }

      const { error } = await supabase
        .from('page_meta_translations' as any)
        .insert(newEntries);

      if (error) throw error;

      toast({
        title: 'Page meta created successfully!',
        description: `Created ${newEntries.length} new page meta entries`
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: 'Bulk creation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsCreatingBulk(false);
    }
  }

  async function handleGenerateAllDescriptions(languageCode: string) {
    setIsGeneratingAll(true);
    
    try {
      const metasToGenerate = pageMetas.filter(
        m => m.language_code === languageCode && 
        (!m.meta_description || m.meta_description.includes('Description needed'))
      );

      if (metasToGenerate.length === 0) {
        toast({ title: 'All descriptions already generated' });
        return;
      }

      let successCount = 0;
      
      for (const meta of metasToGenerate) {
        try {
          const { data, error } = await supabase.functions.invoke('generate-meta-description', {
            body: {
              pageSlug: meta.page_slug,
              metaTitle: meta.meta_title,
              language: languageCode,
            }
          });

          if (!error && data.meta_description) {
            await supabase
              .from('page_meta_translations' as any)
              .update({
                meta_description: data.meta_description,
                quality_score: data.quality_score || null,
              })
              .eq('id', meta.id);
            
            successCount++;
          }
        } catch (e) {
          console.error(`Failed to generate for ${meta.page_slug}:`, e);
        }
      }

      toast({
        title: 'AI generation complete!',
        description: `Generated ${successCount} of ${metasToGenerate.length} meta descriptions`
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: 'Bulk generation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingAll(false);
    }
  }

  async function handleApproveHighQuality(languageCode: string) {
    try {
      const { count } = await supabase
        .from('page_meta_translations' as any)
        .select('*', { count: 'exact', head: true })
        .eq('language_code', languageCode)
        .gte('quality_score', 85)
        .neq('review_status', 'approved');

      if (!count) {
        toast({ title: 'No high-quality entries to approve' });
        return;
      }

      const { error } = await supabase
        .from('page_meta_translations' as any)
        .update({ review_status: 'approved' })
        .eq('language_code', languageCode)
        .gte('quality_score', 85)
        .neq('review_status', 'approved');

      if (error) throw error;

      toast({
        title: 'Auto-approved high-quality entries',
        description: `Approved ${count} entries with quality ≥85%`
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: 'Auto-approval failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleGenerateMetaDescription(metaId: string, pageSlug: string, metaTitle: string, lang: string) {
    setIsGenerating(metaId);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-meta-description', {
        body: {
          pageSlug,
          metaTitle,
          language: lang,
        }
      });

      if (error) throw error;

      if (data.meta_description) {
        const { error: updateError } = await supabase
          .from('page_meta_translations' as any)
          .update({
            meta_description: data.meta_description,
            quality_score: data.quality_score || null,
          })
          .eq('id', metaId);

        if (updateError) throw updateError;

        toast({ title: 'Meta description generated successfully' });
        loadData();
      }
    } catch (error: any) {
      console.error('Error generating meta description:', error);
      toast({ 
        title: 'Failed to generate meta description', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(null);
    }
  }

  async function handleSave(meta: any) {
    try {
      const { error } = await supabase
        .from('page_meta_translations' as any)
        .update(meta)
        .eq('id', meta.id);

      if (error) throw error;

      toast({ title: 'Meta data saved successfully' });
      loadData();
    } catch (error: any) {
      toast({ 
        title: 'Error saving meta data', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  }

  async function handleAddMeta() {
    try {
      const { error } = await supabase
        .from('page_meta_translations' as any)
        .insert([formData]);

      if (error) throw error;

      toast({ title: 'Page meta added successfully' });
      setIsAddDialogOpen(false);
      setFormData({
        page_slug: '/',
        language_code: 'en',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image_url: '',
        twitter_title: '',
        twitter_description: '',
        twitter_image_url: '',
        canonical_url: '',
      });
      loadData();
    } catch (error: any) {
      toast({ 
        title: 'Error adding page meta', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  }

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('page_meta_translations' as any)
      .update({ review_status: 'approved' })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error approving meta', variant: 'destructive' });
    } else {
      toast({ title: 'Meta approved' });
      loadData();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Page Meta & SEO Manager</h2>
        <p className="text-muted-foreground">
          Manage SEO meta tags, Open Graph, and Twitter Cards for all pages across languages.
        </p>
      </div>

      {/* SEO Setup Wizard */}
      <SEOSetupWizard
        totalPages={totalPages}
        totalLanguages={enabledLanguages.length}
        requiredEntries={requiredEntries}
        completedEntries={completedEntries}
        averageQuality={avgQuality}
        onGenerateAllPageMeta={() => handleBulkCreatePageMeta()}
        onGenerateSitemap={() => {
          // Redirect to sitemap tab
          window.location.hash = '#sitemap';
        }}
        isGenerating={isCreatingBulk}
      />

      {/* Global Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleBulkCreatePageMeta()}
              disabled={isCreatingBulk}
              size="lg"
              variant="default"
            >
              {isCreatingBulk ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Auto-Generate All Page Meta
                </>
              )}
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Single Page Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Page Meta</DialogTitle>
                  <DialogDescription>
                    Add SEO meta tags for a page in a specific language.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="page_slug">Page Slug *</Label>
                      <Input
                        id="page_slug"
                        placeholder="e.g. /, /pricing, /features"
                        value={formData.page_slug}
                        onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Language *</Label>
                      <Select 
                        value={formData.language_code}
                        onValueChange={(val) => setFormData({ ...formData, language_code: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.native_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="meta_title">Meta Title * (≤60 chars)</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description (≤160 chars)</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      maxLength={160}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMeta}>Add Page Meta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{completedEntries}/{requiredEntries}</div>
                <div className="text-xs text-muted-foreground">Meta Entries Created</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Tabs */}
      <Tabs value={selectedLang} onValueChange={setSelectedLang}>
        <TabsList className="flex-wrap h-auto">
          {languages.map((lang) => {
            const Flag = (Flags as any)[lang.flag_code];
            const langMetas = pageMetas.filter(m => m.language_code === lang.code);
            const missingCount = pages.length - langMetas.length;
            
            return (
              <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                {Flag && <Flag className="w-5 h-3" />}
                {lang.native_name}
                {missingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-[10px] h-5">
                    {missingCount} missing
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {languages.map((lang) => {
          const langMetas = pageMetas.filter(m => m.language_code === lang.code);
          const missingCount = pages.length - langMetas.length;
          
          return (
            <TabsContent key={lang.code} value={lang.code}>
              {/* Per-language actions */}
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by page slug or title..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="high">High (≥85%)</SelectItem>
                      <SelectItem value="medium">Medium (70-84%)</SelectItem>
                      <SelectItem value="low">Low (&lt;70%)</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {missingCount > 0 && (
                  <Card className="border-orange-500/30 bg-orange-500/5">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm">
                          {missingCount} page{missingCount > 1 ? 's' : ''} missing meta entries for {lang.native_name}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleBulkCreatePageMeta(lang.code)}
                        disabled={isCreatingBulk}
                        size="sm"
                      >
                        {isCreatingBulk ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          `Create Missing Pages`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {langMetas.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGenerateAllDescriptions(lang.code)}
                      disabled={isGeneratingAll}
                      variant="outline"
                      size="sm"
                    >
                      {isGeneratingAll ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-2" />
                          AI Generate All Descriptions
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleApproveHighQuality(lang.code)}
                      variant="outline"
                      size="sm"
                    >
                      <Check className="w-3 h-3 mr-2" />
                      Approve High Quality (≥85%)
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {filteredMetas.map((meta) => (
                  <Card key={meta.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base font-mono">{meta.page_slug}</span>
                        <div className="flex gap-2">
                          {meta.quality_score && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                meta.quality_score >= 85 ? "border-green-600 text-green-600" :
                                meta.quality_score >= 70 ? "border-yellow-600 text-yellow-600" :
                                "border-red-600 text-red-600"
                              )}
                            >
                              Quality: {meta.quality_score}%
                            </Badge>
                          )}
                          {meta.review_status === 'needs_review' && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Needs Review
                            </Badge>
                          )}
                          {meta.review_status === 'approved' && (
                            <Badge variant="default" className="gap-1">
                              <Check className="w-3 h-3" />
                              Approved
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Meta Title ({meta.meta_title?.length || 0}/60)</Label>
                        <Input
                          value={meta.meta_title}
                          onChange={(e) => {
                            const updated = { ...meta, meta_title: e.target.value };
                            setPageMetas(pageMetas.map(m => m.id === meta.id ? updated : m));
                          }}
                          maxLength={60}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label>Meta Description ({meta.meta_description?.length || 0}/160)</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateMetaDescription(meta.id, meta.page_slug, meta.meta_title, lang.code)}
                            disabled={isGenerating === meta.id}
                          >
                            {isGenerating === meta.id ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Generate
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={meta.meta_description || ''}
                          onChange={(e) => {
                            const updated = { ...meta, meta_description: e.target.value };
                            setPageMetas(pageMetas.map(m => m.id === meta.id ? updated : m));
                          }}
                          maxLength={160}
                          rows={3}
                        />
                      </div>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Advanced Settings (OG, Twitter, Canonical) →
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3 space-y-3 p-3 bg-muted/30 rounded-md">
                          <div>
                            <Label>Canonical URL</Label>
                            <Input
                              value={meta.canonical_url || ''}
                              onChange={(e) => {
                                const updated = { ...meta, canonical_url: e.target.value };
                                setPageMetas(pageMetas.map(m => m.id === meta.id ? updated : m));
                              }}
                              placeholder="https://noddi.tech/page"
                            />
                          </div>
                          <div>
                            <Label>OG Image URL</Label>
                            <Input
                              value={meta.og_image_url || ''}
                              onChange={(e) => {
                                const updated = { ...meta, og_image_url: e.target.value };
                                setPageMetas(pageMetas.map(m => m.id === meta.id ? updated : m));
                              }}
                              placeholder="https://..."
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(meta)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save Changes
                        </Button>
                        {meta.review_status !== 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApprove(meta.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredMetas.length === 0 && langMetas.length > 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No page meta matches your filters.
                    </CardContent>
                  </Card>
                )}

                {langMetas.length === 0 && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-8">
                      <div className="text-center space-y-4">
                        <FileText className="w-12 h-12 mx-auto text-primary/50" />
                        <h3 className="text-lg font-semibold">Get Started with {lang.native_name} SEO</h3>
                        <p className="text-sm text-muted-foreground">
                          No page meta entries found for {lang.native_name}.
                          <br />
                          You have {pages.length} published page{pages.length > 1 ? 's' : ''} that need SEO metadata.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => handleBulkCreatePageMeta(lang.code)}
                            disabled={isCreatingBulk}
                          >
                            {isCreatingBulk ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              `Create All Page Meta for ${lang.native_name}`
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                            Create Individually
                          </Button>
                        </div>
                        <div className="pt-4 text-xs text-muted-foreground">
                          This will create meta entries for:
                          <div className="grid grid-cols-3 gap-2 mt-2 max-w-md mx-auto">
                            {pages.slice(0, 6).map(page => (
                              <div key={page.slug} className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="font-mono text-xs">{page.slug}</span>
                              </div>
                            ))}
                          </div>
                          {pages.length > 6 && (
                            <div className="mt-2">...and {pages.length - 6} more</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
