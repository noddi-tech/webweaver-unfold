import { UserX, MapPinOff, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TextContent {
  element_type: string;
  content: string;
}

interface NoHiddenCostsProps {
  textContent: TextContent[];
}

export const NoHiddenCosts = ({ textContent }: NoHiddenCostsProps) => {
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
    <Card className="liquid-glass p-8 max-w-4xl mx-auto border-2 border-primary/20 relative overflow-hidden">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5 pointer-events-none" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
            {getContent('h3', 'No Hidden Costs')}
          </h3>
          <p className="text-muted-foreground">
            {getContent('subtitle', 'Simple, transparent pricing with no surprises')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
      </div>
    </Card>
  );
};
