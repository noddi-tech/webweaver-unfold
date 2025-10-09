import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export function PricingFAQ() {
  const { t } = useAppTranslation();

  const faqs = [
    {
      question: t('pricing_faq.question_1', 'Is there a free tier?'),
      answer: t('pricing_faq.answer_1', 'No. Billing starts from your first euro of revenue. We believe in transparent, performance-based pricing that scales with your success—no free tier games, just fair pricing from day one.')
    },
    {
      question: t('pricing_faq.question_2', 'Why revenue-based pricing?'),
      answer: t('pricing_faq.answer_2', 'Revenue-based pricing ensures you pay in proportion to the value you get from our platform. When you grow, we grow together. This alignment of incentives means we\'re always working to help you succeed.')
    },
    {
      question: t('pricing_faq.question_3', 'How are rates calculated?'),
      answer: t('pricing_faq.answer_3', 'Rates are calculated using a single-tier flat-rate system based on your monthly SaaS revenue. There are no complex tiers or sudden jumps—just straightforward percentage-based pricing that scales smoothly with your business.')
    },
    {
      question: t('pricing_faq.question_4', 'Do you offer discounts?'),
      answer: t('pricing_faq.answer_4', 'Yes! We offer two types of contract discounts: a 3% discount for 6-month pre-payment contracts, and a 5% discount for annual contracts. These discounts provide significant savings while giving you budget predictability.')
    },
    {
      question: t('pricing_faq.question_5', 'Is there a minimum commitment?'),
      answer: t('pricing_faq.answer_5', 'No minimum commitment is required for the standard pay-as-you-go model. However, if you opt for a contract with pre-payment, you\'ll benefit from our discount rates while locking in predictable costs.')
    },
    {
      question: t('pricing_faq.question_6', 'What happens if my revenue changes?'),
      answer: t('pricing_faq.answer_6', 'Your pricing automatically adjusts as your revenue changes. The rate you pay stays consistent, so your costs scale proportionally with your growth—no surprises, no manual adjustments needed.')
    },
    {
      question: t('pricing_faq.question_7', 'Are there any hidden fees?'),
      answer: t('pricing_faq.answer_7', 'No hidden fees whatsoever. The usage fee includes everything: unlimited users, all features, updates, and support. What you see is what you pay—simple and transparent.')
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('pricing_faq.title', 'Frequently Asked Questions')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('pricing_faq.subtitle', 'Everything you need to know about our pricing')}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
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
