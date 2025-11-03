import { Button } from "@/components/ui/button";
import { Sparkles, TrendingDown, Zap } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { EditableText } from "@/components/EditableText";
import { LockedText } from "@/components/LockedText";

interface TextContent {
  element_type: string;
  content: string;
}

interface PricingHeroProps {
  textContent: TextContent[];
}

export default function PricingHero({ textContent }: PricingHeroProps) {
  const { h1, body } = useTypography();
  
  const getCMSContent = (elementType: string, fallback: string = ''): string => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  return (
    <section className="pt-section pb-20">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-4xl md:mx-auto space-y-8">
          <EditableText contentId="pricing-h1" className="">
            <h1 className={`${h1} text-foreground`}>
              {getCMSContent('h1', 'Pay as you grow')}
            </h1>
          </EditableText>
          <EditableText contentId="pricing-subtitle" className="">
            <p className={`${body} text-muted-foreground`}>
              {getCMSContent('p', 'Transparent revenue-based pricing that scales with your business')}
            </p>
          </EditableText>
          <div className="flex flex-wrap justify-start md:justify-center gap-6 text-sm">
            {[
              { icon: Sparkles, contentId: 'pricing-usp-1', text: getCMSContent('usp_1', 'World class UX') },
              { icon: TrendingDown, contentId: 'pricing-usp-2', text: getCMSContent('usp_2', 'Rates decrease as you grow') },
              { icon: Zap, contentId: 'pricing-usp-3', text: getCMSContent('usp_3', 'Optimize your margin, not your headcount') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-foreground">
                <item.icon className="w-5 h-5 text-foreground" />
                <EditableText contentId={item.contentId} className="">
                  <span>{item.text}</span>
                </EditableText>
              </div>
            ))}
          </div>
          
          <div className="pt-12">
            <Button size="lg" className="text-lg px-8 accessible-focus" asChild>
              <a 
                href="https://calendly.com/joachim-noddi/30min"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LockedText reason="CTA button text">
                  {getCMSContent('button_book_demo', 'Book a meeting with us')}
                </LockedText>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
