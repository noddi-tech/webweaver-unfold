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

const Newsroom = () => {
  const { t } = useAppTranslation();

  useEffect(() => {
    document.title = t("newsroom.meta.title", "Newsroom – Navio");
    ensureMeta("description", t("newsroom.meta.description", "Latest news, press releases, and announcements from Navio."));
  }, [t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="newsroom.hero.title" fallbackText="Newsroom" disableStyling>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {t("newsroom.hero.title", "Newsroom")}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="newsroom.hero.subtitle" fallbackText="Latest news and announcements">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("newsroom.hero.subtitle", "Latest news and announcements")}
            </p>
          </EditableTranslation>
        </section>

        {/* Press Releases Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="newsroom.press.title" fallbackText="Press Releases">
            <h2 className="text-3xl font-bold mb-8">
              {t("newsroom.press.title", "Press Releases")}
            </h2>
          </EditableTranslation>
          <div className="space-y-6">
            <div className="p-6 bg-card text-card-foreground rounded-xl border border-border">
              <EditableTranslation translationKey="newsroom.press.coming_soon" fallbackText="Press releases coming soon." disableStyling>
                <p className="text-card-foreground/70">
                  {t("newsroom.press.coming_soon", "Press releases coming soon. Stay tuned for the latest updates from Navio.")}
                </p>
              </EditableTranslation>
            </div>
          </div>
        </section>

        {/* Media Kit Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="newsroom.media.title" fallbackText="Media Kit">
            <h2 className="text-3xl font-bold mb-6">
              {t("newsroom.media.title", "Media Kit")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="newsroom.media.description" fallbackText="Download our brand assets, logos, and press materials.">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t("newsroom.media.description", "Download our brand assets, logos, and press materials for your publications.")}
            </p>
          </EditableTranslation>
        </section>

        {/* Contact Section */}
        <section className="max-w-4xl mx-auto">
          <EditableTranslation translationKey="newsroom.contact.title" fallbackText="Press Contact">
            <h2 className="text-3xl font-bold mb-6">
              {t("newsroom.contact.title", "Press Contact")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="newsroom.contact.description" fallbackText="For media inquiries, please contact our press team.">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("newsroom.contact.description", "For media inquiries, please contact our press team.")}
            </p>
          </EditableTranslation>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Newsroom;
