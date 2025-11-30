import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function ArchitectureHero() {
  const { h1, body } = useTypography();
  const { t } = useAppTranslation();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <EditableTranslation translationKey="architecture.hero.title">
            <h1 className={`${h1} mb-6 text-foreground`}>
              {t('architecture.hero.title', 'One data model. One brain. Real-time everything.')}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="architecture.hero.subtitle">
            <p className={`${body} text-muted-foreground mb-8`}>
              {t('architecture.hero.subtitle', 'Navio runs backend and frontend in perfect sync — because they\'re the same thing.')}
            </p>
          </EditableTranslation>
          <Button size="lg" className="text-lg px-8 py-6 group" asChild>
            <LanguageLink to="/contact">
              <EditableTranslation translationKey="architecture.hero.cta">
                <span>{t('architecture.hero.cta', 'Book a technical demo')}</span>
              </EditableTranslation>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </LanguageLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
