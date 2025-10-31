import { Button } from "@/components/ui/button";
import { ArrowRight, Layers } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function FunctionsCTA() {
  const { h2 } = useTypography();
  const { t } = useAppTranslation();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <EditableTranslation translationKey="functions_cta.title">
            <h2 className={`${h2} mb-6 text-foreground`}>
              {t('functions_cta.title', 'Want to see how the logic plays out?')}
            </h2>
          </EditableTranslation>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                <EditableTranslation translationKey="functions_cta.button_primary">
                  <span>{t('functions_cta.button_primary', 'Book a live walkthrough')}</span>
                </EditableTranslation>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <LanguageLink to="/architecture">
                <Layers className="w-5 h-5 mr-2" />
                <EditableTranslation translationKey="functions_cta.button_secondary">
                  <span>{t('functions_cta.button_secondary', 'See the architecture')}</span>
                </EditableTranslation>
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
