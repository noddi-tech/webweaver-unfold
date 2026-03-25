import { Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EditableTranslation } from './EditableTranslation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface TestimonialStory {
  quote_text: string | null;
  quote_author: string | null;
  quote_author_title: string | null;
  company_name: string;
  company_logo_url: string | null;
  slug: string;
}

export default function CustomerTestimonial() {
  const { t, currentLanguage } = useAppTranslation();

  const { data: story, isLoading } = useQuery({
    queryKey: ['homepage-testimonial'],
    queryFn: async (): Promise<TestimonialStory | null> => {
      const { data: settings } = await (supabase as any)
        .from('testimonial_settings')
        .select('customer_story_id')
        .limit(1)
        .maybeSingle();

      if (!settings?.customer_story_id) return null;

      const { data, error } = await supabase
        .from('customer_stories')
        .select('quote_text, quote_author, quote_author_title, company_name, company_logo_url, slug')
        .eq('id', settings.customer_story_id)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching testimonial story:', error);
        return null;
      }
      return data;
    },
  });

  if (!isLoading && !story) return null;

  const initials = story?.company_name?.slice(0, 2).toUpperCase() ?? '';
  const lang = currentLanguage || 'en';

  return (
    <section className="bg-background py-20 md:py-28 lg:py-36">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <EditableTranslation translationKey="testimonial.eyebrow">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('testimonial.eyebrow', 'TESTIMONIAL')}
          </span>
        </EditableTranslation>

        <Quote className="mx-auto h-12 w-12 text-muted-foreground/15 mb-8 mt-4" strokeWidth={1.5} />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
            <Skeleton className="h-14 w-14 rounded-full mx-auto mt-10" />
          </div>
        ) : story ? (
          <>
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed italic tracking-tight text-foreground">
              {story.quote_text}
            </blockquote>

            <div className="mt-10 flex flex-col items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={story.company_logo_url || '/placeholder.svg'}
                  alt={story.company_name}
                  className="object-contain p-1"
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base font-semibold text-foreground">
                  {story.quote_author || ''}
                </span>
                <span className="text-sm text-muted-foreground">
                  {story.quote_author_title || ''}
                </span>
              </div>

              <span className="mt-1 text-xs text-muted-foreground/60 tracking-wide uppercase">
                {story.company_name}
              </span>

              {story.slug && (
                <Link
                  to={`/${lang}/stories/${story.slug}`}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline transition-colors"
                >
                  {t('testimonial.read_more', 'Read the full story')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
