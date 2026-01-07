import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

const ensureMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const AboutUs = () => {
  const { t } = useAppTranslation();

  useEffect(() => {
    document.title = t("about.meta.title", "About Us – Navio");
    ensureMeta("description", t("about.meta.description", "Learn about Navio, our mission, and the team building the future of automotive services."));
  }, [t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="about.hero.title" fallbackText="About Navio">
            <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
              {t("about.hero.title", "About Navio")}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="about.hero.subtitle" fallbackText="Building the future of automotive services">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("about.hero.subtitle", "Building the future of automotive services")}
            </p>
          </EditableTranslation>
        </section>

        {/* Mission Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="about.mission.title" fallbackText="Our Mission">
            <h2 className="text-3xl font-bold mb-6">
              {t("about.mission.title", "Our Mission")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="about.mission.description" fallbackText="We're on a mission to transform how automotive services are booked and delivered.">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.mission.description", "We're on a mission to transform how automotive services are booked and delivered. By connecting drivers with trusted service providers through seamless technology, we're making car care simpler, faster, and more transparent.")}
            </p>
          </EditableTranslation>
        </section>

        {/* Values Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="about.values.title" fallbackText="Our Values">
            <h2 className="text-3xl font-bold mb-8">
              {t("about.values.title", "Our Values")}
            </h2>
          </EditableTranslation>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card text-card-foreground rounded-xl border border-border">
              <EditableTranslation translationKey="about.values.innovation.title" fallbackText="Innovation">
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {t("about.values.innovation.title", "Innovation")}
                </h3>
              </EditableTranslation>
              <EditableTranslation translationKey="about.values.innovation.description" fallbackText="We constantly push boundaries to create better solutions.">
                <p className="text-card-foreground/70">
                  {t("about.values.innovation.description", "We constantly push boundaries to create better solutions for our customers and partners.")}
                </p>
              </EditableTranslation>
            </div>
            <div className="p-6 bg-card text-card-foreground rounded-xl border border-border">
              <EditableTranslation translationKey="about.values.trust.title" fallbackText="Trust">
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {t("about.values.trust.title", "Trust")}
                </h3>
              </EditableTranslation>
              <EditableTranslation translationKey="about.values.trust.description" fallbackText="Transparency and reliability are at the core of everything we do.">
                <p className="text-card-foreground/70">
                  {t("about.values.trust.description", "Transparency and reliability are at the core of everything we do.")}
                </p>
              </EditableTranslation>
            </div>
            <div className="p-6 bg-card text-card-foreground rounded-xl border border-border">
              <EditableTranslation translationKey="about.values.partnership.title" fallbackText="Partnership">
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {t("about.values.partnership.title", "Partnership")}
                </h3>
              </EditableTranslation>
              <EditableTranslation translationKey="about.values.partnership.description" fallbackText="We succeed when our partners and customers succeed.">
                <p className="text-card-foreground/70">
                  {t("about.values.partnership.description", "We succeed when our partners and customers succeed.")}
                </p>
              </EditableTranslation>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-4xl mx-auto">
          <EditableTranslation translationKey="about.story.title" fallbackText="Our Story">
            <h2 className="text-3xl font-bold mb-6">
              {t("about.story.title", "Our Story")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="about.story.description" fallbackText="Founded with the vision of modernizing the automotive aftermarket.">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.story.description", "Founded with the vision of modernizing the automotive aftermarket, Navio has grown from a small startup to a trusted platform serving thousands of customers across multiple markets. Our journey is just beginning.")}
            </p>
          </EditableTranslation>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
