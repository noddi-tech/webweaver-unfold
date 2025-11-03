import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useFAQs } from "@/hooks/useFAQs";

export function PricingFAQ() {
  const { t } = useAppTranslation();
  const { faqs, loading } = useFAQs('pricing');

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('pricing_faq.title', 'Frequently Asked Questions')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('pricing_faq.subtitle', 'Everything you need to know about our pricing')}
          </p>
        </div>
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('pricing_faq.title', 'Frequently Asked Questions')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('pricing_faq.subtitle', 'Everything you need to know about our pricing')}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
