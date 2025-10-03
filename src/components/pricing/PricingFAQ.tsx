import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function PricingFAQ() {
  const faqs = [
    {
      question: "Why revenue-based pricing?",
      answer: "Revenue-based pricing ensures you pay in proportion to the value you get. As your business grows and generates more revenue, your costs scale with you—but your effective rate decreases. This model aligns our success with yours."
    },
    {
      question: "How are rates calculated?",
      answer: "Rates are calculated using a tiered system across 10 revenue ranges. Each tier has a specific take-rate that applies to revenue within that range. As you move into higher tiers, your take-rate decreases by approximately 20% per tier, resulting in continuously decreasing effective rates."
    },
    {
      question: "Do you offer discounts?",
      answer: "Yes! We offer two types of contract discounts: 15% off with a monthly contract, and 25% off with a yearly contract. These discounts apply to your entire usage cost, providing significant savings."
    },
    {
      question: "Is there a minimum commitment?",
      answer: "No minimum commitment is required for the standard pay-as-you-go model. Monthly and yearly contracts offer discounts but come with their respective commitment periods. You can cancel anytime with appropriate notice."
    },
    {
      question: "What happens if my revenue changes?",
      answer: "Your pricing automatically adjusts as your revenue changes. If your revenue increases, you'll move into higher tiers with lower take-rates. If it decreases, your costs adjust proportionally. This ensures you always pay a fair rate."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees whatsoever. The usage fee includes everything: platform access, AI features, customer support, updates, and maintenance. There are no separate SaaS licence fees, no seat fees, and no surprise charges."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to know about our pricing
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
