import { UserX, MapPinOff, ShieldCheck, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import { LockedText } from "@/components/LockedText";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";

interface TextContent {
  element_type: string;
  content: string;
}

interface NoHiddenCostsProps {
  textContent: TextContent[];
  onOpenCalculator?: () => void;
}

export const NoHiddenCosts = ({ textContent, onOpenCalculator }: NoHiddenCostsProps) => {
  const getContent = (elementType: string, fallback: string = ''): string => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  const items = [
    {
      icon: UserX,
      title: getContent('item_1_title', 'No seat fees'),
      description: getContent('item_1_desc', 'Pay for revenue, not users'),
    },
    {
      icon: MapPinOff,
      title: getContent('item_2_title', 'Transparent tiers'),
      description: getContent('item_2_desc', 'Clear pricing at every level'),
    },
    {
      icon: ShieldCheck,
      title: getContent('item_3_title', 'No surprise fees'),
      description: getContent('item_3_desc', 'What you see is what you pay'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <EditableText contentId="pricing-no-hidden-costs-h3" className="">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {getContent('h3', 'No Hidden Costs')}
          </h3>
        </EditableText>
        <EditableText contentId="pricing-no-hidden-costs-subtitle" className="">
          <p className="text-muted-foreground">
            {getContent('subtitle', 'Simple, transparent pricing with no surprises')}
          </p>
        </EditableText>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {items.map((item, index) => (
          <EditableCard
            key={index}
            elementIdPrefix={`pricing-no-hidden-cost-${index + 1}`}
            defaultBackground="bg-background/50"
            className="text-center rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <div className="p-4 space-y-3" role="article" aria-label={item.title}>
              <EditableCardIcon icon={item.icon} />
              <EditableCardTitle className="text-lg font-semibold">
                {item.title}
              </EditableCardTitle>
              <EditableCardDescription className="text-sm">
                {item.description}
              </EditableCardDescription>
            </div>
          </EditableCard>
        ))}
      </div>

      {/* Calculator CTA Section - Only shown when onOpenCalculator is provided */}
      {onOpenCalculator && (
        <div className="text-center pt-8 border-t border-border/50">
          <EditableText contentId="pricing-calculator-h2" className="">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {getContent('h2_calculator', 'Need a Precise Estimate?')}
            </h2>
          </EditableText>
          <EditableText contentId="pricing-calculator-subtitle" className="">
            <p className="text-muted-foreground mb-6">
              {getContent('p_calculator', 'Enter your revenue and service mix to see your cost.')}
            </p>
          </EditableText>
          <Button size="lg" onClick={onOpenCalculator} className="accessible-focus">
            <Calculator className="w-5 h-5 mr-2" />
            <LockedText reason="Button text">
              {getContent('button_calculator', 'Open Advanced Calculator')}
            </LockedText>
          </Button>
        </div>
      )}
    </div>
  );
};
