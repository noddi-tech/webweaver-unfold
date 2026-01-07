import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { Briefcase, Heart, Rocket, Users } from "lucide-react";

const ensureMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const Careers = () => {
  const { t } = useAppTranslation();

  const benefits = [
    { icon: Rocket, titleKey: "careers.benefits.growth.title", descKey: "careers.benefits.growth.description", titleFallback: "Growth", descFallback: "Continuous learning and career development opportunities" },
    { icon: Heart, titleKey: "careers.benefits.culture.title", descKey: "careers.benefits.culture.description", titleFallback: "Culture", descFallback: "Inclusive, collaborative, and innovation-driven environment" },
    { icon: Users, titleKey: "careers.benefits.team.title", descKey: "careers.benefits.team.description", titleFallback: "Team", descFallback: "Work with talented people who are passionate about what they do" },
    { icon: Briefcase, titleKey: "careers.benefits.flexibility.title", descKey: "careers.benefits.flexibility.description", titleFallback: "Flexibility", descFallback: "Flexible work arrangements to support work-life balance" },
  ];

  useEffect(() => {
    document.title = t("careers.meta.title", "Careers – Navio");
    ensureMeta("description", t("careers.meta.description", "Join our team and help build the future of automotive services."));
  }, [t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="careers.hero.title" fallbackText="Join Our Team">
            <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
              {t("careers.hero.title", "Join Our Team")}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="careers.hero.subtitle" fallbackText="Help us transform the automotive industry">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("careers.hero.subtitle", "Help us transform the automotive industry")}
            </p>
          </EditableTranslation>
        </section>

        {/* Why Join Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="careers.why.title" fallbackText="Why Join Navio?">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t("careers.why.title", "Why Join Navio?")}
            </h2>
          </EditableTranslation>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 bg-card rounded-xl border border-border flex gap-4">
                <div className="flex-shrink-0">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <EditableTranslation translationKey={benefit.titleKey} fallbackText={benefit.titleFallback}>
                    <h3 className="text-xl font-semibold mb-2">
                      {t(benefit.titleKey, benefit.titleFallback)}
                    </h3>
                  </EditableTranslation>
                  <EditableTranslation translationKey={benefit.descKey} fallbackText={benefit.descFallback}>
                    <p className="text-muted-foreground">
                      {t(benefit.descKey, benefit.descFallback)}
                    </p>
                  </EditableTranslation>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="careers.positions.title" fallbackText="Open Positions">
            <h2 className="text-3xl font-bold mb-8">
              {t("careers.positions.title", "Open Positions")}
            </h2>
          </EditableTranslation>
          <div className="p-8 bg-card rounded-xl border border-border text-center">
            <EditableTranslation translationKey="careers.positions.empty" fallbackText="No open positions at the moment.">
              <p className="text-muted-foreground">
                {t("careers.positions.empty", "No open positions at the moment. Check back soon or send us your CV for future opportunities.")}
              </p>
            </EditableTranslation>
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-4xl mx-auto text-center">
          <EditableTranslation translationKey="careers.contact.title" fallbackText="Get in Touch">
            <h2 className="text-3xl font-bold mb-6">
              {t("careers.contact.title", "Get in Touch")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="careers.contact.description" fallbackText="Interested in joining us?">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("careers.contact.description", "Interested in joining us? Send your CV and a brief introduction to our careers team.")}
            </p>
          </EditableTranslation>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
