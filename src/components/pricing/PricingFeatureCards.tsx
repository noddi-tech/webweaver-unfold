import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrencyConfig } from "@/config/pricing";

interface PricingFeatureCardsProps {
  currency: string;
}

export function PricingFeatureCards({ currency }: PricingFeatureCardsProps) {
  const config = getCurrencyConfig(currency);
  const symbol = config.symbol;

  const cards = [
    {
      tier: "Small/Basic",
      range: `Up to ${symbol}${currency === 'NOK' ? '20M' : '2M'}`,
      color: "bg-green-600 text-white border-green-700",
      rates: [
        "Garage: 4% take-rate",
        "Shop: 5% take-rate",
        "Mobile: 10% take-rate"
      ],
      benefits: [
        "High NPS scores",
        "AI-powered scheduling",
        "No seat fees",
        "World-class UX"
      ],
      cta: "Talk to Sales"
    },
    {
      tier: "Large",
      range: `${symbol}${currency === 'NOK' ? '20M – 400M' : '2M – 40M'}`,
      color: "bg-amber-500 text-white border-amber-600",
      rates: [
        "Rates decrease ~20% per tier",
        "Continuous pricing reduction",
        "No sudden jumps"
      ],
      benefits: [
        "All Small/Basic features",
        "Reduced effective rates",
        "Scale automatically",
        "Dedicated support"
      ],
      cta: "Book a Demo"
    },
    {
      tier: "Enterprise",
      range: `${symbol}${currency === 'NOK' ? '400M+' : '40M+'}`,
      color: "bg-gradient-primary text-primary-foreground border-primary",
      rates: [
        "Lowest rates, down to ~1%",
        "Maximum value",
        "Custom contracts available"
      ],
      benefits: [
        "All Large features",
        "Lowest effective rates",
        "Priority support",
        "Custom integrations"
      ],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {cards.map((card) => (
        <Card 
          key={card.tier}
          className="p-6 space-y-6 relative transition-all duration-200 hover:shadow-lg hover-scale"
        >

          <div className="space-y-3">
            <Badge className={`${card.color} text-xs font-semibold px-3 py-1`}>
              {card.tier}
            </Badge>
            <div className="text-sm text-muted-foreground">{card.range}</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Starting Rates</h4>
            <ul className="space-y-1">
              {card.rates.map((rate) => (
                <li key={rate} className="text-xs text-muted-foreground">
                  • {rate}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Key Benefits</h4>
            <ul className="space-y-2">
              {card.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            className="w-full"
            variant="outline"
            asChild
          >
            <Link to="/contact">{card.cta}</Link>
          </Button>
        </Card>
      ))}
    </div>
  );
}
