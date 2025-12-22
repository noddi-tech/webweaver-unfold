import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTypography } from "@/hooks/useTypography";
import { useCustomerStories } from "@/hooks/useCustomerStory";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Stories() {
  const { h1, h2, body } = useTypography();
  const { data: stories, isLoading } = useCustomerStories();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-section bg-muted">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              Customer Stories
            </p>
            <h1 className={`${h1} text-foreground mb-6`}>
              See how companies succeed with Navio
            </h1>
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              Discover how businesses across industries are transforming their operations and delighting customers.
            </p>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-section bg-background">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-border">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stories?.map((story) => (
                  <Link
                    key={story.id}
                    to={`/${currentLang}/stories/${story.slug}`}
                    className="group rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    style={{ backgroundImage: 'var(--gradient-hero)' }}
                  >
                    {/* Card Image */}
                    {story.hero_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={story.hero_image_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                    
                    {/* Card Content */}
                    <div className="p-6 relative">
                      <p className="text-sm font-medium text-white/80 mb-2">
                        {story.company_name}
                      </p>
                      <h2 className="text-lg md:text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors line-clamp-2 pr-16">
                        {story.title}
                      </h2>
                      
                      <div className="flex items-center text-white font-medium text-sm group-hover:gap-3 gap-2 transition-all">
                        Read story
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      
                      {/* Company Logo */}
                      {story.company_logo_url && (
                        <div className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-lg p-2 flex items-center justify-center shadow-md">
                          <img
                            src={story.company_logo_url}
                            alt={`${story.company_name} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isLoading && (!stories || stories.length === 0) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No customer stories available yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
