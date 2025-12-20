import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTypography } from "@/hooks/useTypography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Quote } from "lucide-react";

// Mock data for the customer story template
const mockStory = {
  companyName: "Nordic Fleet Solutions",
  companyLogo: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/navio-logo-dark.png",
  title: "How Nordic Fleet Solutions Transformed Their Service Operations with Navio",
  heroImage: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/dashboard-preview.jpg",
  results: [
    { title: "Booking Efficiency", metric: "+47%" },
    { title: "Customer Satisfaction", metric: "94 NPS" },
    { title: "Support Tickets", metric: "-35%" },
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
              <div className="space-y-6">
                <img 
                  src={mockStory.companyLogo} 
                  alt={`${mockStory.companyName} logo`}
                  className="h-12 w-auto object-contain"
                />
                <h1 className={`${h1} text-foreground`}>
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
              {mockStory.results.map((result, index) => (
                <Card key={index} className="bg-card text-card-foreground border-0">
                  <CardContent className="p-8 text-center">
                    <p className={`${caption} text-card-foreground/80 uppercase tracking-wide mb-2`}>
                      {result.title}
                    </p>
                    <p className="text-5xl font-bold text-card-foreground">
                      {result.metric}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
        <section className="py-section bg-primary">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Quote className="w-12 h-12 text-primary-foreground/40 mx-auto mb-6" />
              <blockquote className={`${h3} text-primary-foreground mb-8 italic`}>
                "{mockStory.quote.text}"
              </blockquote>
              <div>
                <p className="text-lg font-semibold text-primary-foreground">
                  {mockStory.quote.author}
                </p>
                <p className={`${caption} text-primary-foreground/80`}>
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
        <section className="py-section bg-primary">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`${h2} text-primary-foreground mb-4`}>
              Ready to transform your operations?
            </h2>
            <p className={`${body} text-primary-foreground/80 mb-8 max-w-2xl mx-auto`}>
              Join Nordic Fleet Solutions and hundreds of other companies already using Navio.
            </p>
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Today
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
