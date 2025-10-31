import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageLink } from "@/components/LanguageLink";
import { ArrowRight } from "lucide-react";

interface KeyBenefit {
  id: string;
  heading: string;
  description: string;
  imageUrl: string;
}

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);

  // Mock data - will be replaced with CMS data later
  const mockSolution = {
    // Hero Section
    heroHeading: "Transform Your Business with AI-Powered Solutions",
    heroDescription: "Streamline operations and boost productivity with our cutting-edge platform designed for modern enterprises seeking digital transformation.",
    heroImageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    heroCtaText: "Get Started",
    heroCtaUrl: "/contact",
    
    // Description Section
    descriptionHeading: "Built for Scale, Designed for Success",
    descriptionText: "Our solution combines powerful automation with intuitive interfaces to help your team work smarter, not harder. Whether you're managing complex workflows or streamlining customer interactions, our platform adapts to your unique business needs while maintaining enterprise-grade security and reliability.",
    
    // Key Benefits
    keyBenefits: [
      {
        id: "1",
        heading: "Automated Workflow Management",
        description: "Eliminate manual processes and reduce errors with intelligent automation that learns from your operations. Our AI-powered system identifies bottlenecks and suggests optimizations in real-time.",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
      },
      {
        id: "2",
        heading: "Real-Time Analytics Dashboard",
        description: "Make data-driven decisions with comprehensive insights into your operations. Track KPIs, monitor performance, and identify trends with customizable dashboards that bring clarity to complex data.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
      },
      {
        id: "3",
        heading: "Seamless Integrations",
        description: "Connect with your existing tools and platforms effortlessly. Our solution integrates with over 100+ popular business applications, ensuring your data flows smoothly across your entire tech stack.",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop"
      }
    ],
    
    // Footer Section
    footerHeading: "Ready to Transform Your Operations?",
    footerCtaText: "Start your journey today and see results within weeks, not months.",
    footerButtonText: "Schedule a Demo",
    footerButtonUrl: "/demo"
  };

  useEffect(() => {
    // In the future, fetch solution data based on slug
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading solution...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                {mockSolution.heroHeading}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {mockSolution.heroDescription}
              </p>
              <Button size="lg" className="text-lg px-8" asChild>
                <LanguageLink to={mockSolution.heroCtaUrl}>
                  {mockSolution.heroCtaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </LanguageLink>
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={mockSolution.heroImageUrl} 
                alt="Solution Hero"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {mockSolution.descriptionHeading}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {mockSolution.descriptionText}
          </p>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl space-y-24">
          {mockSolution.keyBenefits.map((benefit, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={benefit.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
              >
                <div className={!isEven ? 'lg:col-start-2' : ''}>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    {benefit.heading}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
                <div className={`rounded-2xl overflow-hidden shadow-xl ${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <img 
                    src={benefit.imageUrl}
                    alt={benefit.heading}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Solution Footer / CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
            {mockSolution.footerHeading}
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8">
            {mockSolution.footerCtaText}
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <LanguageLink to={mockSolution.footerButtonUrl}>
              {mockSolution.footerButtonText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </LanguageLink>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SolutionDetail;
