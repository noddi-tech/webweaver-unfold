import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EditableTranslation } from './EditableTranslation';
import { EditableBackground } from './EditableBackground';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface TestimonialStory {
  quote_text: string | null;
  quote_author: string | null;
  quote_author_title: string | null;
  quote_author_image_url: string | null;
  company_name: string;
  company_logo_url: string | null;
  slug: string;
}

export default function CustomerTestimonial() {
  const { t, currentLanguage } = useAppTranslation();

  const { data: story, isLoading } = useQuery({
    queryKey: ['homepage-testimonial'],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<TestimonialStory | null> => {
      const { data: settings } = await (supabase as any)
        .from('testimonial_settings')
        .select('customer_story_id')
        .limit(1)
        .maybeSingle();

      if (!settings?.customer_story_id) return null;

      const { data, error } = await (supabase as any)
        .from('customer_stories')
        .select('quote_text, quote_author, quote_author_title, quote_author_image_url, company_name, company_logo_url, slug')
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

  const initials = story?.quote_author?.slice(0, 2).toUpperCase() ?? story?.company_name?.slice(0, 2).toUpperCase() ?? '';
  const lang = currentLanguage || 'en';
  const avatarSrc = story?.quote_author_image_url || story?.company_logo_url || '/placeholder.svg';

  return (
    <EditableBackground elementId="testimonial-section" defaultBackground="bg-muted/30">
    <section className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <EditableTranslation translationKey="testimonial.eyebrow">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('testimonial.eyebrow', 'TESTIMONIAL')}
          </span>
        </EditableTranslation>

        {isLoading ? (
          <div className="space-y-4 mt-8">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
            <Skeleton className="h-24 w-24 rounded-full mx-auto mt-10" />
          </div>
        ) : story ? (
          <>
            <blockquote className="relative mt-8 px-8 md:px-12">
              <span className="absolute -top-6 left-0 md:-left-4 text-7xl md:text-8xl text-primary/10 font-serif select-none leading-none" aria-hidden="true">
                &ldquo;
              </span>
              <p className="text-2xl md:text-4xl lg:text-5xl font-serif italic font-medium leading-relaxed text-foreground">
                {story.quote_text}
              </p>
              <span className="absolute -bottom-12 right-0 md:-right-4 text-7xl md:text-8xl text-primary/10 font-serif select-none leading-none" aria-hidden="true">
                &rdquo;
              </span>
            </blockquote>

            <div className="mt-16 flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-background shadow-lg">
                <AvatarImage
                  src={avatarSrc}
                  alt={story.quote_author || story.company_name}
                  className={story.quote_author_image_url ? 'object-cover' : 'object-contain p-1'}
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-semibold text-foreground">
                  {story.quote_author || ''}
                </span>
                <span className="text-sm text-muted-foreground">
                  {story.quote_author_title || ''}
                </span>
              </div>

              <span className="text-xs text-muted-foreground/60 tracking-wide uppercase">
                {story.company_name}
              </span>

              {story.slug && (
                <Link
                  to={`/${lang}/stories/${story.slug}`}
                  className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-primary hover:underline transition-colors"
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
    </EditableBackground>
  );
}
