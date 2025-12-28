import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTypography } from "@/hooks/useTypography";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, Smile, Users, Calendar, Clock, TrendingUp, Star, Zap, Target, Award, Settings } from "lucide-react";
import { useCustomerStory } from "@/hooks/useCustomerStory";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableStoryField, EditableStoryImage, EditableStoryResults } from "@/components/EditableStoryField";
import { useEditMode } from "@/contexts/EditModeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smile,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Target,
  Award,
};

export default function CustomerStory() {
  const { slug, lang } = useParams();
  const navigate = useNavigate();
  const { h2, h3, body, caption } = useTypography();
  const { data: story, isLoading, error } = useCustomerStory(slug);
  const { editMode } = useEditMode();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-section">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-section">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Story not found</h1>
            <p className="text-muted-foreground mb-8">The customer story you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Section 1: Hero */}
        <section className="py-section bg-muted">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Logo + Title */}
              <div className="space-y-4">
                {story.company_logo_url && (
                  <EditableStoryImage
                    storyId={story.id}
                    field="company_logo_url"
                    value={story.company_logo_url}
                  >
                    <img 
                      src={story.company_logo_url} 
                      alt={`${story.company_name} logo`}
                      className="h-10 w-auto object-contain"
                    />
                  </EditableStoryImage>
                )}
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Customer Story
                </p>
                <EditableStoryField
                  storyId={story.id}
                  field="title"
                  value={story.title}
                >
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {story.title}
                  </h1>
                </EditableStoryField>
              </div>
              
              {/* Right: Hero Image */}
              {story.hero_image_url && (
                <EditableStoryImage
                  storyId={story.id}
                  field="hero_image_url"
                  value={story.hero_image_url}
                  className="relative"
                >
                  <img 
                    src={story.hero_image_url}
                    alt="Customer story hero"
                    className="w-full rounded-2xl shadow-xl object-cover aspect-video"
                  />
                </EditableStoryImage>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Results Highlights - Mixpanel-inspired layout */}
        {story.results.length > 0 && (
          <section className="py-section bg-muted/50">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <EditableStoryResults
                storyId={story.id}
                results={story.results}
              >
                <div className="bg-background rounded-2xl p-8 md:p-12">
                  <div 
                    className="grid gap-8 md:gap-0"
                    style={{ 
                      gridTemplateColumns: `repeat(${Math.min(story.results.length, 4)}, 1fr)` 
                    }}
                  >
                    {story.results.map((result, index) => (
                      <div 
                        key={index} 
                        className={`flex flex-col ${
                          index > 0 ? 'md:border-l md:border-border md:pl-8' : ''
                        }`}
                      >
                        <p className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                          {result.metric}
                        </p>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[200px]">
                          {result.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </EditableStoryResults>
            </div>
          </section>
        )}

        {/* Section 3: CTA Button */}
        <section className="py-12 bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <Button size="lg" className="gap-2" asChild>
              <Link to={story.final_cta_button_url || '/contact'}>
                {story.final_cta_button_text || 'Book a Demo'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Section 4: About Section */}
        {story.about_company && (
          <section className="py-section bg-muted">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <EditableStoryField
                  storyId={story.id}
                  field="company_name"
                  value={story.company_name}
                >
                  <h2 className={`${h2} text-foreground mb-8`}>
                    About {story.company_name}
                  </h2>
                </EditableStoryField>
                <EditableStoryField
                  storyId={story.id}
                  field="about_company"
                  value={story.about_company}
                  multiline
                >
                  <div className={`${body} text-muted-foreground space-y-4`}>
                    {story.about_company.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </EditableStoryField>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: Quote */}
        {story.quote_text && (
          <section className="py-section bg-background">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center bg-gradient-hero">
                <Quote className="w-12 h-12 text-white/40 mx-auto mb-6" />
                <EditableStoryField
                  storyId={story.id}
                  field="quote_text"
                  value={story.quote_text}
                  multiline
                >
                  <blockquote className={`${h3} text-white mb-8 italic`}>
                    "{story.quote_text}"
                  </blockquote>
                </EditableStoryField>
                {(story.quote_author || story.quote_author_title) && (
                  <div>
                    {story.quote_author && (
                      <EditableStoryField
                        storyId={story.id}
                        field="quote_author"
                        value={story.quote_author}
                      >
                        <p className="text-lg font-semibold text-white">
                          {story.quote_author}
                        </p>
                      </EditableStoryField>
                    )}
                    {story.quote_author_title && (
                      <EditableStoryField
                        storyId={story.id}
                        field="quote_author_title"
                        value={story.quote_author_title}
                      >
                        <p className={`${caption} text-white/80`}>
                          {story.quote_author_title}
                        </p>
                      </EditableStoryField>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section 6: The Use-Case */}
        {story.use_case && (
          <section className="py-section bg-muted">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className={`${h2} text-foreground mb-8`}>
                  The Use-Case
                </h2>
                <EditableStoryField
                  storyId={story.id}
                  field="use_case"
                  value={story.use_case}
                  multiline
                >
                  <div className={`${body} text-muted-foreground space-y-4`}>
                    {story.use_case.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </EditableStoryField>
              </div>
            </div>
          </section>
        )}

        {/* Section 7: Impact Statement */}
        {story.impact_statement && (
          <section className="py-section bg-background">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className={`${h2} text-foreground mb-8`}>
                  The Impact
                </h2>
                <EditableStoryField
                  storyId={story.id}
                  field="impact_statement"
                  value={story.impact_statement}
                  multiline
                >
                  <div className={`${body} text-muted-foreground space-y-4`}>
                    {story.impact_statement.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </EditableStoryField>
              </div>
            </div>
          </section>
        )}

        {/* Section 8: Product Screenshot */}
        {story.product_screenshot_url && (
          <section className="py-section bg-muted">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <EditableStoryImage
                  storyId={story.id}
                  field="product_screenshot_url"
                  value={story.product_screenshot_url}
                >
                  <img 
                    src={story.product_screenshot_url}
                    alt="Product screenshot"
                    className="w-full rounded-2xl shadow-2xl"
                  />
                </EditableStoryImage>
              </div>
            </div>
          </section>
        )}

        {/* Section 9: Final CTA */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center bg-gradient-hero">
              <EditableStoryField
                storyId={story.id}
                field="final_cta_heading"
                value={story.final_cta_heading}
              >
                <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  {story.final_cta_heading || 'Ready to transform your operations?'}
                </h3>
              </EditableStoryField>
              {story.final_cta_description && (
                <EditableStoryField
                  storyId={story.id}
                  field="final_cta_description"
                  value={story.final_cta_description}
                >
                  <p className="text-xl mb-10 opacity-95 leading-relaxed text-white">
                    {story.final_cta_description}
                  </p>
                </EditableStoryField>
              )}
              <Button size="lg" variant="secondary" className="text-lg px-8 gap-2" asChild>
                <Link to={story.final_cta_button_url || '/contact'}>
                  {story.final_cta_button_text || 'Get Started Today'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Admin Panel - Only visible in edit mode */}
        {editMode && (
          <section className="py-section bg-muted border-t-2 border-dashed border-border">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <Card className="border-border bg-background text-foreground shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-primary" />
                    Admin Fields
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These fields are not displayed on the page but can be edited here.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Slug */}
                  <div className="grid gap-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        defaultValue={story.slug}
                        className="font-mono text-sm"
                        onBlur={async (e) => {
                          const newSlug = e.target.value.trim().toLowerCase().replace(/\s+/g, '-');
                          if (newSlug && newSlug !== story.slug) {
                            setIsSaving(true);
                            const { error } = await supabase
                              .from('customer_stories')
                              .update({ slug: newSlug })
                              .eq('id', story.id);
                            setIsSaving(false);
                            if (error) {
                              toast.error('Failed to update slug');
                            } else {
                              toast.success('Slug updated');
                              queryClient.invalidateQueries({ queryKey: ['customer-story'] });
                              queryClient.invalidateQueries({ queryKey: ['customer-stories'] });
                              navigate(`/${lang}/stories/${newSlug}`, { replace: true });
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current URL: /stories/{story.slug}
                    </p>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active</Label>
                      <p className="text-xs text-muted-foreground">
                        When disabled, this story won't be visible to the public.
                      </p>
                    </div>
                    <Switch
                      checked={story.active}
                      onCheckedChange={async (checked) => {
                        setIsSaving(true);
                        const { error } = await supabase
                          .from('customer_stories')
                          .update({ active: checked })
                          .eq('id', story.id);
                        setIsSaving(false);
                        if (error) {
                          toast.error('Failed to update status');
                        } else {
                          toast.success(checked ? 'Story activated' : 'Story deactivated');
                          queryClient.invalidateQueries({ queryKey: ['customer-story'] });
                          queryClient.invalidateQueries({ queryKey: ['customer-stories'] });
                        }
                      }}
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="grid gap-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      defaultValue={story.sort_order || 0}
                      className="w-24"
                      onBlur={async (e) => {
                        const newOrder = parseInt(e.target.value) || 0;
                        if (newOrder !== story.sort_order) {
                          setIsSaving(true);
                          const { error } = await supabase
                            .from('customer_stories')
                            .update({ sort_order: newOrder })
                            .eq('id', story.id);
                          setIsSaving(false);
                          if (error) {
                            toast.error('Failed to update sort order');
                          } else {
                            toast.success('Sort order updated');
                            queryClient.invalidateQueries({ queryKey: ['customer-story'] });
                            queryClient.invalidateQueries({ queryKey: ['customer-stories'] });
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower numbers appear first in the stories list.
                    </p>
                  </div>

                  {/* Metadata (read-only) */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground space-y-1">
                      <span className="block">ID: {story.id}</span>
                      <span className="block">Created: {new Date(story.created_at).toLocaleString()}</span>
                      <span className="block">Updated: {new Date(story.updated_at).toLocaleString()}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
