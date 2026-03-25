import { Quote } from 'lucide-react';
import { EditableTranslation } from './EditableTranslation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CustomerTestimonial() {
  const { t } = useAppTranslation();

  return (
    <section className="bg-background py-20 md:py-28 lg:py-36">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        {/* Decorative quote icon */}
        <Quote className="mx-auto h-12 w-12 text-muted-foreground/15 mb-8" strokeWidth={1.5} />

        {/* Quote text */}
        <EditableTranslation translationKey="testimonial.quote">
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed italic tracking-tight">
            {t('testimonial.quote', 'We kept Eontyre for what it does well and added Navio for booking and routing. The integration means our team works in one flow — no double entry, no switching between systems.')}
          </blockquote>
        </EditableTranslation>

        {/* Attribution */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-muted text-muted-foreground text-lg font-semibold">
              TD
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center gap-0.5">
            <EditableTranslation translationKey="testimonial.author_name">
              <span className="text-base font-semibold">
                {t('testimonial.author_name', '[Name]')}
              </span>
            </EditableTranslation>

            <EditableTranslation translationKey="testimonial.author_title">
              <span className="text-sm text-muted-foreground">
                {t('testimonial.author_title', 'Operations Manager, Trønderdekk')}
              </span>
            </EditableTranslation>
          </div>

          {/* Company badge */}
          <EditableTranslation translationKey="testimonial.company_name">
            <span className="mt-1 text-xs text-muted-foreground/60 tracking-wide uppercase">
              {t('testimonial.company_name', 'Trønderdekk')}
            </span>
          </EditableTranslation>
        </div>
      </div>
    </section>
  );
}
