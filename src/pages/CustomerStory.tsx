import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTypography } from "@/hooks/useTypography";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, Smile, Users, Calendar, Clock, TrendingUp, Star, Zap, Target, Award } from "lucide-react";
import { useCustomerStory } from "@/hooks/useCustomerStory";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smile,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Target,
  Award,
};

export default function CustomerStory() {
  const { slug } = useParams();
  const { h2, h3, body, caption } = useTypography();
  const { data: story, isLoading, error } = useCustomerStory(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-section">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-section">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Story not found</h1>
            <p className="text-muted-foreground mb-8">The customer story you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                {story.company_logo_url && (
                  <img 
                    src={story.company_logo_url} 
                    alt={`${story.company_name} logo`}
                    className="h-10 w-auto object-contain"
                  />
                )}
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Customer Story
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {story.title}
                </h1>
              </div>
              
              {/* Right: Hero Image */}
              {story.hero_image_url && (
                <div className="relative">
                  <img 
                    src={story.hero_image_url}
                    alt="Customer story hero"
                    className="w-full rounded-2xl shadow-xl object-cover aspect-video"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Results Highlights */}
        {story.results.length > 0 && (
          <section className="py-section bg-background">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {story.results.map((result, index) => {
                  const IconComponent = iconMap[result.icon] || Smile;
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
        )}

        {/* Section 3: CTA Button */}
        <section className="py-12 bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <Button size="lg" className="gap-2" asChild>
              <Link to={story.final_cta_button_url || '/contact'}>
                {story.final_cta_button_text || 'Book a Demo'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Section 4: About Section */}
        {story.about_company && (
          <section className="py-section bg-muted">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className={`${h2} text-foreground mb-8`}>
                  About {story.company_name}
                </h2>
                <div className={`${body} text-muted-foreground space-y-4`}>
                  {story.about_company.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: Quote */}
        {story.quote_text && (
          <section className="py-section bg-background">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center bg-gradient-hero">
                <Quote className="w-12 h-12 text-white/40 mx-auto mb-6" />
                <blockquote className={`${h3} text-white mb-8 italic`}>
                  "{story.quote_text}"
                </blockquote>
                {(story.quote_author || story.quote_author_title) && (
                  <div>
                    {story.quote_author && (
                      <p className="text-lg font-semibold text-white">
                        {story.quote_author}
                      </p>
                    )}
                    {story.quote_author_title && (
                      <p className={`${caption} text-white/80`}>
                        {story.quote_author_title}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section 6: The Use-Case */}
        {story.use_case && (
          <section className="py-section bg-muted">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className={`${h2} text-foreground mb-8`}>
                  The Use-Case
                </h2>
                <div className={`${body} text-muted-foreground space-y-4`}>
                  {story.use_case.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 7: Impact Statement */}
        {story.impact_statement && (
          <section className="py-section bg-background">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className={`${h2} text-foreground mb-8`}>
                  The Impact
                </h2>
                <div className={`${body} text-muted-foreground space-y-4`}>
                  {story.impact_statement.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 8: Product Screenshot */}
        {story.product_screenshot_url && (
          <section className="py-section bg-muted">
            <div className="container max-w-container px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <img 
                  src={story.product_screenshot_url}
                  alt="Product screenshot"
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </section>
        )}

        {/* Section 9: Final CTA */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center bg-gradient-hero">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                {story.final_cta_heading || 'Ready to transform your operations?'}
              </h3>
              {story.final_cta_description && (
                <p className="text-xl mb-10 opacity-95 leading-relaxed text-white">
                  {story.final_cta_description}
                </p>
              )}
              <Button size="lg" variant="secondary" className="text-lg px-8 gap-2" asChild>
                <Link to={story.final_cta_button_url || '/contact'}>
                  {story.final_cta_button_text || 'Get Started Today'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
