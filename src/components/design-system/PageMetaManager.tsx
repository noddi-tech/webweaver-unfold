import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Sparkles, Loader2, Plus, AlertTriangle } from 'lucide-react';
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

export default function PageMetaManager() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState<any[]>([]);
  const [pageMetas, setPageMetas] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchFilter, setSearchFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<any>(null);
  const [qualityFilter, setQualityFilter] = useState<string>('all');

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
    const [{ data: langs }, { data: metas }] = await Promise.all([
      supabase.from('languages').select('*').order('sort_order'),
      supabase.from('page_meta_translations' as any).select('*').order('page_slug, language_code'),
    ]);
    
    if (langs) setLanguages(langs);
    if (metas) setPageMetas(metas);
  }

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
        // Update the meta description
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
      setEditingMeta(null);
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
        <h2 className="text-3xl font-bold mb-2">Page Meta Manager</h2>
        <p className="text-muted-foreground">
          Manage SEO meta tags, Open Graph, and Twitter Cards for all pages across languages.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Page Meta
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
              <div>
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  placeholder="https://noddi.tech/page"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMeta}>Add Page Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Language Tabs */}
      <Tabs value={selectedLang} onValueChange={setSelectedLang}>
        <TabsList className="flex-wrap h-auto">
          {languages.map((lang) => {
            const Flag = (Flags as any)[lang.flag_code];
            return (
              <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                {Flag && <Flag className="w-5 h-3" />}
                {lang.native_name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code}>
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
              
              {filteredMetas.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No page meta found for {lang.native_name}. Add one to get started!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
