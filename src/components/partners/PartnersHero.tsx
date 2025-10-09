import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function PartnersHero() {
  const { h1, body } = useTypography();
  const { t } = useAppTranslation();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className={`${h1} mb-6 text-foreground`}>
            {t('partners_hero.h1', 'Trusted by those who keep the world moving.')}
          </h1>
          <p className={`${body} text-muted-foreground mb-8`}>
            {t('partners_hero.subtitle', '20,000+ bookings and counting — powered by one platform.')}
          </p>
          <Button size="lg" className="text-lg px-8 py-6 group" asChild>
            <LanguageLink to="/contact">
              {t('partners_hero.button', 'Become a partner')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </LanguageLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
