import { UserX, MapPinOff, ShieldCheck, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextContent {
  element_type: string;
  content: string;
}

interface NoHiddenCostsProps {
  textContent: TextContent[];
  onOpenCalculator: () => void;
}

export const NoHiddenCosts = ({ textContent, onOpenCalculator }: NoHiddenCostsProps) => {
  const getContent = (elementType: string, fallback: string = ''): string => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  const items = [
    {
      icon: UserX,
      title: getContent('item_1_title', 'No seat cost'),
      description: getContent('item_1_desc', 'Pay for usage, not headcount'),
    },
    {
      icon: MapPinOff,
      title: getContent('item_2_title', 'No cost per location'),
      description: getContent('item_2_desc', 'Same rate across all branches'),
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
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {getContent('h3', 'No Hidden Costs')}
        </h3>
        <p className="text-muted-foreground">
          {getContent('subtitle', 'Simple, transparent pricing with no surprises')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {items.map((item, index) => (
          <div
            key={index}
            className="text-center space-y-3 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            role="article"
            aria-label={item.title}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <item.icon className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-semibold text-foreground">
              {item.title}
            </h4>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Book a Demo CTA */}
      <div className="text-center mb-12">
        <Button size="lg" className="text-lg px-8 accessible-focus" asChild>
          <a 
            href="https://calendly.com/joachim-noddi/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            {getContent('button_book_demo', 'Book a Demo')}
          </a>
        </Button>
      </div>

      {/* Calculator CTA Section */}
      <div className="text-center pt-8 border-t border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {getContent('h2_calculator', 'Need a Precise Estimate?')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {getContent('p_calculator', 'Enter your revenue and service mix to see your cost.')}
        </p>
        <Button size="lg" onClick={onOpenCalculator} className="accessible-focus">
          <Calculator className="w-5 h-5 mr-2" />
          {getContent('button_calculator', 'Open Advanced Calculator')}
        </Button>
      </div>
    </div>
  );
};
