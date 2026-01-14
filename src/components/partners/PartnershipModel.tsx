import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableCard } from "@/components/EditableCard";

export default function PartnershipModel() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const benefits = [
    t('partnership_model.benefit_1', 'White-label ready'),
    t('partnership_model.benefit_2', 'Plug-in brand setup (< 1 day)'),
    t('partnership_model.benefit_3', 'Pay per booking'),
    t('partnership_model.benefit_4', 'Grow together'),
  ];
  
  return (
    <section className="py-section" data-header-color="dark">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('partnership_model.title', 'A SaaS model that scales with performance — not promises.')}
            </h2>
            <p className={`${body} text-muted-foreground`}>
              {t('partnership_model.subtitle', 'Our partners pay per booking. As they grow, we grow.')}
            </p>
          </div>

          <EditableCard
            elementIdPrefix="partners-benefits-card"
            defaultBackground="glass-card"
            defaultTextColor="foreground"
            className="mb-8"
          >
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </EditableCard>

          <div className="text-center">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                {t('partnership_model.button', "Let's talk setup")}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
