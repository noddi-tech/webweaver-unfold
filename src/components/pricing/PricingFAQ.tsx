import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useFAQs } from "@/hooks/useFAQs";
import { EditableFAQ } from "@/components/EditableFAQ";
import { StructuredData } from "@/components/StructuredData";

export function PricingFAQ() {
  const { t } = useAppTranslation();
  const { faqs, loading, error } = useFAQs('pricing');

  const refetchFAQs = () => {
    window.location.reload();
  };

  // FAQPage JSON-LD schema
  const faqSchema = useMemo(() => {
    if (!faqs || faqs.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }, [faqs]);

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
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('pricing_faq.title', 'Frequently Asked Questions')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('pricing_faq.subtitle', 'Everything you need to know about our pricing')}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <EditableFAQ
            key={faq.id}
            faqId={faq.id}
            question={faq.question}
            answer={faq.answer}
            onUpdate={refetchFAQs}
          >
            <AccordionItem value={faq.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          </EditableFAQ>
        ))}
      </Accordion>
      </div>
    </>
  );
}
