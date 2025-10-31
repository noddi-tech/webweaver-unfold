import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function FunctionsHero() {
  const { h1, body } = useTypography();
  const { t } = useAppTranslation();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <EditableTranslation translationKey="functions_hero.h1">
            <h1 className={`${h1} mb-6 text-foreground`}>
              {t('functions_hero.h1', 'Every function. One platform.')}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="functions_hero.subtitle">
            <p className={`${body} text-muted-foreground mb-8 block mt-6`}>
              {t('functions_hero.subtitle', 'From booking to billing, everything connects — automatically.')}
            </p>
          </EditableTranslation>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                <EditableTranslation translationKey="functions_hero.button_primary">
                  <span>{t('functions_hero.button_primary', 'Book a demo')}</span>
                </EditableTranslation>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <LanguageLink to="/architecture">
                <Eye className="w-5 h-5 mr-2" />
                <EditableTranslation translationKey="functions_hero.button_secondary">
                  <span>{t('functions_hero.button_secondary', 'See how the system thinks')}</span>
                </EditableTranslation>
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
