import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ArrowRight, Link2, Layers, FileOutput } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableIcon } from "@/components/EditableIcon";
import { Badge } from "@/components/ui/badge";

export default function Integrations() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const onSave = () => setRefreshKey((k) => k + 1);

  const cards = [
    {
      prefix: "integrations-card-1",
      icon: Link2,
      labelKey: "integrations.card_1.label",
      labelFallback: "Deep integration",
      titleKey: "integrations.card_1.title",
      titleFallback: "Connected to Eontyre at Trønderdekk",
      descKey: "integrations.card_1.description",
      descFallback:
        "Trønderdekk runs their tire business on Eontyre. Instead of asking them to switch, we built a direct integration. Bookings, customer data, and service records sync automatically — no double entry, no manual exports.",
      quoteKey: "integrations.card_1.quote",
      quoteFallback:
        '"We kept Eontyre for what it does well and added Navio for booking and routing. The integration means we didn\'t have to choose."',
      isQuote: true,
    },
    {
      prefix: "integrations-card-2",
      icon: Layers,
      labelKey: "integrations.card_2.label",
      labelFallback: "Multi-vendor stack",
      titleKey: "integrations.card_2.title",
      titleFallback: "One of many tools, fully connected",
      descKey: "integrations.card_2.description",
      descFallback:
        "Some customers run several specialized systems side by side — inventory, CRM, invoicing. Navio fits in as the booking, capacity, and route planning layer, with data flowing through our API. No overlap, no conflict.",
      quoteKey: "integrations.card_2.note",
      quoteFallback:
        "Used by service networks running multi-vendor software setups across locations.",
      isQuote: false,
    },
    {
      prefix: "integrations-card-3",
      icon: FileOutput,
      labelKey: "integrations.card_3.label",
      labelFallback: "Data export",
      titleKey: "integrations.card_3.title",
      titleFallback: "Just need the data out? That works too.",
      descKey: "integrations.card_3.description",
      descFallback:
        "Not every integration needs to be real-time. If you need clean exports of bookings, service logs, or capacity data into your own reporting tools or ERP, Navio supports structured data export out of the box.",
      quoteKey: null,
      quoteFallback: null,
      isQuote: false,
    },
  ];

  const techItems = ["REST API", "Webhooks", "Custom integrations", "CSV / JSON export"];

  return (
    <section ref={ref as any} className="py-12 md:py-16 lg:py-section" data-header-color="dark">
      <div className="container max-w-5xl px-4 sm:px-6 lg:px-8" key={refreshKey}>
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <EditableTranslation translationKey="integrations.title" onSave={onSave}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t("integrations.title", "Works with the systems you already use")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="integrations.subtitle" onSave={onSave}>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(
                "integrations.subtitle",
                "You don't need to replace your current software. We build integrations that connect directly to your existing system — so your team works in one flow, not two."
              )}
            </p>
          </EditableTranslation>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {cards.map((card, i) => (
            <EditableCard
              key={card.prefix}
              elementIdPrefix={card.prefix}
              defaultBackground="bg-card"
              defaultTextColor="foreground"
              className={`border transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style-delay={i * 150}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <EditableIcon
                  elementId={`${card.prefix}-icon`}
                  icon={card.icon}
                  size="default"
                  className="mb-4"
                />

                <EditableTranslation translationKey={card.labelKey} onSave={onSave}>
                  <Badge variant="secondary" className="w-fit mb-3 text-xs">
                    {t(card.labelKey, card.labelFallback)}
                  </Badge>
                </EditableTranslation>

                <EditableTranslation translationKey={card.titleKey} onSave={onSave}>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {t(card.titleKey, card.titleFallback)}
                  </h3>
                </EditableTranslation>

                <EditableTranslation translationKey={card.descKey} onSave={onSave}>
                  <p className="text-muted-foreground mb-4 flex-1">
                    {t(card.descKey, card.descFallback)}
                  </p>
                </EditableTranslation>

                {card.quoteKey && (
                  <EditableTranslation translationKey={card.quoteKey} onSave={onSave}>
                    {card.isQuote ? (
                      <blockquote className="border-l-2 border-primary/30 pl-4 text-sm italic text-muted-foreground">
                        {t(card.quoteKey, card.quoteFallback!)}
                      </blockquote>
                    ) : (
                      <p className="text-sm text-muted-foreground/80 mt-auto">
                        {t(card.quoteKey, card.quoteFallback!)}
                      </p>
                    )}
                  </EditableTranslation>
                )}
              </CardContent>
            </EditableCard>
          ))}
        </div>

        {/* Tech credibility */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {techItems.map((item) => (
            <Badge key={item} variant="outline" className="text-sm px-4 py-1.5">
              {item}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <EditableTranslation translationKey="integrations.cta_title" onSave={onSave}>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              {t("integrations.cta_title", "Let's map out your integration")}
            </h3>
          </EditableTranslation>
          <EditableTranslation translationKey="integrations.cta_subtitle" onSave={onSave}>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t(
                "integrations.cta_subtitle",
                "Tell us what systems you're running today and we'll show you how Navio connects."
              )}
            </p>
          </EditableTranslation>
          <LanguageLink to="/contact">
            <EditableTranslation translationKey="integrations.cta_button" onSave={onSave}>
              <Button size="lg" className="text-lg px-8 py-6 group">
                {t("integrations.cta_button", "Book a technical walkthrough")}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </EditableTranslation>
          </LanguageLink>
        </div>
      </div>
    </section>
  );
}
