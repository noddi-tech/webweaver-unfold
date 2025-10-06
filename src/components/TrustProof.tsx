import { Star, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Henrik",
    comment: "Kjempebra service!",
    rating: 5
  },
  {
    name: "Emy Marie",
    comment: "6 stjerner til tekniker! Meget hjelpsom!",
    rating: 5
  },
  {
    name: "Lars",
    comment: "Veldig hyggelig og hjelpsom mann!",
    rating: 5
  }
];

const npsCategories = [
  { label: "Overall", score: 88.7 },
  { label: "Communication", score: 92.8 },
  { label: "Ease of use", score: 91.1 },
  { label: "Politeness", score: 94.8 }
];

export default function TrustProof() {
  return (
    <section className="py-section bg-muted/30">
      <div className="container max-w-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Trusted by the Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Industry-leading customer satisfaction and conversion rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* NPS Score Display */}
          <Card className="bg-gradient-hero border-0">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-background/90 backdrop-blur-sm mb-4 shadow-lg">
                  <div>
                    <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      88.7
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">NPS Score</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  Car Industry's Most Happy Customers
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {npsCategories.map((category, index) => (
                    <div key={index} className="bg-background/50 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary">{category.score}</div>
                      <div className="text-sm text-muted-foreground">{category.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Stats */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    40%
                  </div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Our optimized 6-step booking funnel delivers industry-leading conversion rates, turning more visitors into customers.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Step completion rate</span>
                  <span className="text-sm font-semibold text-foreground">90%+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer return rate</span>
                  <span className="text-sm font-semibold text-foreground">77.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Booking abandonment</span>
                  <span className="text-sm font-semibold text-foreground">&lt;10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground">What Customers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-3 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-foreground">
                        {testimonial.name[0]}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
