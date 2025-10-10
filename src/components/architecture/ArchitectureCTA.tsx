import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function ArchitectureCTA() {
  const { h2 } = useTypography();
  const { t } = useAppTranslation();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className={`${h2} mb-6 text-foreground`}>
            {t('architecture.cta.title', 'See the logic in motion.')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                {t('architecture.cta.button_demo', 'Book a technical demo')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <LanguageLink to="/contact">
                <FileText className="w-5 h-5 mr-2" />
                {t('architecture.cta.button_docs', 'Request docs')}
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
