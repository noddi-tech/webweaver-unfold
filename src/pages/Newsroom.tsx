import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { usePressMentions } from "@/hooks/usePressMentions";
import { format } from "date-fns";
import { ExternalLink, Newspaper } from "lucide-react";

const ensureMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    media_coverage: "MEDIA COVERAGE",
    press_release: "PRESS RELEASE",
    feature: "FEATURE",
    interview: "INTERVIEW",
  };
  return labels[category] || category.toUpperCase();
};

const Newsroom = () => {
  const { t } = useAppTranslation();
  const { data: pressMentions = [], isLoading } = usePressMentions();

  useEffect(() => {
    document.title = t("newsroom.meta.title", "Newsroom – Navio");
    ensureMeta("description", t("newsroom.meta.description", "Latest press coverage and media mentions about Navio."));
  }, [t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20" data-header-color="dark">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            {t("newsroom.hero.title", "Newsroom")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("newsroom.hero.subtitle", "Latest press coverage and media mentions")}
          </p>
        </section>

        {/* Press Coverage Section */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-foreground">
            {t("newsroom.section.title", "Navio in the News")}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-6 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : pressMentions.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {t("newsroom.empty.title", "No press coverage yet")}
              </h3>
              <p className="text-card-foreground/70 max-w-md mx-auto">
                {t("newsroom.empty.description", "Check back soon for the latest news and media coverage about Navio.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pressMentions.map((mention) => (
                <a
                  key={mention.id}
                  href={mention.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Source Logo/Image */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {mention.source_logo_url ? (
                      <img
                        src={mention.source_logo_url}
                        alt={mention.source_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-3xl font-bold text-primary/50">
                          {mention.source_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-background/90 backdrop-blur-sm rounded-full p-2">
                        <ExternalLink className="h-4 w-4 text-foreground" />
                      </div>
                    </div>
                    {mention.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                          FEATURED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-primary tracking-wider">
                        {getCategoryLabel(mention.category)}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {mention.source_name}
                      </span>
                    </div>

                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-3 mb-3">
                      {mention.title}
                    </h3>

                    {mention.excerpt && (
                      <p className="text-sm text-card-foreground/70 line-clamp-2 mb-3">
                        {mention.excerpt}
                      </p>
                    )}

                    {mention.published_at && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(mention.published_at), "MMMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Newsroom;
