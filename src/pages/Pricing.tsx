import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  useEffect(() => {
    document.title = "Pricing | Your Plans";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Choose the perfect plan for your needs');
    }
  }, []);

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 10 projects",
        "Basic analytics",
        "Email support",
        "1GB storage",
      ]
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Best for growing businesses",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "10GB storage",
        "Custom integrations",
        "API access",
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom contract",
        "Unlimited storage",
        "SLA guarantee",
        "Advanced security",
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`p-8 relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Need a custom plan? <a href="/contact" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
