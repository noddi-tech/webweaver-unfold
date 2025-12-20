import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTypography } from "@/hooks/useTypography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Quote, Smile, Users, Calendar } from "lucide-react";

// Mock data for the customer story template
const mockStory = {
  companyName: "Nordic Fleet Solutions",
  companyLogo: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/navio-logo-dark.png",
  title: "How Nordic Fleet Solutions Transformed Their Service Operations with Navio",
  heroImage: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/dashboard-preview.jpg",
  results: [
    { icon: Smile, metric: "+47% booking efficiency", description: "by streamlining the entire service booking flow from discovery to confirmation." },
    { icon: Users, metric: "94 NPS score", description: "achieved through consistent customer experience across all touchpoints." },
    { icon: Calendar, metric: "-35% support tickets", description: "thanks to automated reminders and self-service capabilities." },
  ],
  aboutCompany: `Nordic Fleet Solutions is a leading automotive service provider operating across Scandinavia. With over 150 service locations and a fleet of 2,000+ mobile service units, they serve both individual customers and major corporate clients.

Founded in 2008, the company has grown to become one of the region's most trusted names in vehicle maintenance and repair. Their commitment to innovation and customer experience has been central to their success.

Before implementing Navio, Nordic Fleet Solutions faced significant challenges with fragmented booking systems, manual scheduling, and inconsistent customer communication across their network.`,
  quote: {
    text: "Navio has completely transformed how we manage our service operations. What used to take hours of manual coordination now happens automatically. Our customers love the seamless booking experience, and our teams can focus on what they do best – delivering excellent service.",
    author: "Erik Lindqvist",
    title: "Chief Operations Officer, Nordic Fleet Solutions",
  },
  impactStatement: `Since implementing Navio, Nordic Fleet Solutions has experienced a fundamental shift in their operational efficiency and customer satisfaction.

The integrated booking system has eliminated double-bookings and reduced scheduling conflicts by 89%. Automated reminders have decreased no-show rates from 12% to just 3%, recovering significant revenue that was previously lost.

Perhaps most importantly, the customer feedback loop built into Navio has given Nordic Fleet Solutions unprecedented visibility into their service quality. They now identify and resolve issues in real-time, leading to their highest-ever customer satisfaction scores.

The mobile-first approach has also opened new revenue streams, with 40% of bookings now coming through the customer app – a channel that didn't exist before Navio.`,
  productScreenshot: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/booking-funnel.png",
};

export default function CustomerStory() {
  const { slug } = useParams();
  const { h1, h2, h3, body, caption } = useTypography();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Section 1: Hero */}
        <section className="py-section bg-muted">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Logo + Title */}
              <div className="space-y-4">
                <img 
                  src={mockStory.companyLogo} 
                  alt={`${mockStory.companyName} logo`}
                  className="h-10 w-auto object-contain"
                />
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Customer Story
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {mockStory.title}
                </h1>
              </div>
              
              {/* Right: Hero Image */}
              <div className="relative">
                <img 
                  src={mockStory.heroImage}
                  alt="Customer story hero"
                  className="w-full rounded-2xl shadow-xl object-cover aspect-video"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Results Highlights */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockStory.results.map((result, index) => {
                const IconComponent = result.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-primary/10 rounded-2xl p-8 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 mb-6">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-xl font-bold text-primary mb-3">
                      {result.metric}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: CTA Button */}
        <section className="py-12 bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <Button size="lg" className="gap-2">
              Book a Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Section 4: About Section */}
        <section className="py-section bg-muted">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className={`${h2} text-foreground mb-8`}>
                About {mockStory.companyName}
              </h2>
              <div className={`${body} text-muted-foreground space-y-4`}>
                {mockStory.aboutCompany.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Quote */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center bg-gradient-hero">
              <Quote className="w-12 h-12 text-white/40 mx-auto mb-6" />
              <blockquote className={`${h3} text-white mb-8 italic`}>
                "{mockStory.quote.text}"
              </blockquote>
              <div>
                <p className="text-lg font-semibold text-white">
                  {mockStory.quote.author}
                </p>
                <p className={`${caption} text-white/80`}>
                  {mockStory.quote.title}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Impact Statement */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className={`${h2} text-foreground mb-8`}>
                The Impact
              </h2>
              <div className={`${body} text-muted-foreground space-y-4`}>
                {mockStory.impactStatement.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Product Screenshot */}
        <section className="py-section bg-muted">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <img 
                src={mockStory.productScreenshot}
                alt="Navio product screenshot"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Section 8: Final CTA */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center bg-gradient-hero">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to transform your operations?
              </h3>
              <p className="text-xl mb-10 opacity-95 leading-relaxed text-white">
                Join Nordic Fleet Solutions and hundreds of other companies already using Navio.
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8 gap-2">
                Get Started Today
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
