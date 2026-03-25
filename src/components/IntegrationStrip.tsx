import { useState } from "react";
import { ArrowRight, Globe, Webhook, Wrench, FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";


const techKeys = [
  { key: "integrations_strip.tech_rest_api", fallback: "REST API", icon: Globe },
  { key: "integrations_strip.tech_webhooks", fallback: "Webhooks", icon: Webhook },
  { key: "integrations_strip.tech_custom", fallback: "Custom integrations", icon: Wrench },
  { key: "integrations_strip.tech_export", fallback: "CSV / JSON export", icon: FileJson },
];

export default function IntegrationStrip() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const onSave = () => setRefreshKey((k) => k + 1);

  return (
    <EditableBackground elementId="integrations-strip-section" defaultBackground="bg-muted/50">
      <section
        ref={ref as React.RefObject<HTMLDivElement>}
        className="py-10 md:py-16 border-y border-border/40"
        data-header-color="dark"
      >
        <div
          className={`container max-w-6xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          key={refreshKey}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column — text */}
            <div className="space-y-6">
              <EditableTranslation translationKey="integrations_strip.eyebrow" onSave={onSave}>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("integrations_strip.eyebrow", "Integrations")}
                </span>
              </EditableTranslation>

              <EditableTranslation translationKey="integrations_strip.headline" onSave={onSave}>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t("integrations_strip.headline", "Works with the systems you already use")}
                </h2>
              </EditableTranslation>

              <EditableTranslation translationKey="integrations_strip.description" onSave={onSave}>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {t(
                    "integrations_strip.description",
                    "You don't need to replace your current software. Navio connects directly to your existing tools — bookings, customer data, and service records sync automatically."
                  )}
                </p>
              </EditableTranslation>

              {/* Partner pill */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground">
                  <EditableTranslation translationKey="integrations_strip.partner_eontyre" onSave={onSave}>
                    <span>{t("integrations_strip.partner_eontyre", "Eontyre")}</span>
                  </EditableTranslation>
                </div>
                <EditableTranslation translationKey="integrations_strip.partner_more" onSave={onSave}>
                  <span className="text-sm text-muted-foreground">
                    {t("integrations_strip.partner_more", "+ more coming")}
                  </span>
                </EditableTranslation>
              </div>

              {/* Tech badges with icons */}
              <div className="flex flex-wrap gap-2">
                {techKeys.map(({ key, fallback, icon: Icon }) => (
                  <EditableTranslation key={key} translationKey={key} onSave={onSave}>
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1.5 border-border bg-white text-foreground shadow-sm gap-1.5"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {t(key, fallback)}
                    </Badge>
                  </EditableTranslation>
                ))}
              </div>

              {/* CTA text link */}
              <LanguageLink
                to="/contact"
                className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline underline-offset-4 transition-colors"
              >
                <EditableTranslation translationKey="integrations_strip.cta_link" onSave={onSave}>
                  <span>
                    {t("integrations_strip.cta_link", "Learn more about integrations")}
                  </span>
                </EditableTranslation>
                <ArrowRight className="w-4 h-4" />
              </LanguageLink>
            </div>

            {/* Right column — SVG diagram */}
            <div className="flex justify-center lg:justify-end">
              <svg
                viewBox="0 0 500 310"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md"
                role="img"
                aria-label="Integration diagram showing two-way data sync between your system and Navio"
              >
              {/* Left box — Your system */}
                <rect x="10" y="60" width="160" height="160" rx="20" 
                  fill="white" stroke="hsl(249, 67%, 24%)" strokeWidth="2" />
                <text x="90" y="128" textAnchor="middle" fill="hsl(249, 67%, 24%)" fontSize="17" fontWeight="700">
                  {t("integrations_strip.diagram_your_system", "Your system")}
                </text>
                <text x="90" y="152" textAnchor="middle" fill="hsl(249, 67%, 24%)" fontSize="12" opacity="0.7">
                  {t("integrations_strip.diagram_your_system_subtitle", "ERP · CRM · DMS")}
                </text>

                {/* Right box — Navio */}
                <foreignObject x="330" y="60" width="160" height="160">
                  <div className="w-full h-full rounded-[20px]" 
                    style={{ 
                      backgroundImage: 'var(--gradient-warmth)', 
                      border: '2px solid hsl(249 67% 24%)' 
                    }} />
                </foreignObject>
                <text x="410" y="128" textAnchor="middle" className="fill-primary-foreground" fontSize="17" fontWeight="700">
                  {t("integrations_strip.diagram_navio", "Navio")}
                </text>
                <text x="410" y="152" textAnchor="middle" className="fill-primary-foreground" fontSize="12" opacity="0.8">
                  {t("integrations_strip.diagram_navio_subtitle", "Booking · Routing · Capacity")}
                </text>

                {/* Top arrow → right: single curved path arcing above sync circle */}
                <path
                  d="M170 120 C210 80, 290 80, 330 120"
                  className="stroke-primary"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="none"
                  style={{ animation: "dash-flow 1.5s linear infinite" }}
                />
                <text x="250" y="75" textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="500">
                  {t("integrations_strip.diagram_data_outbound", "Bookings · Customers")}
                </text>

                {/* Bottom arrow ← left: single curved path arcing below sync circle */}
                <path
                  d="M330 160 C290 200, 210 200, 170 160"
                  className="stroke-primary"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="none"
                  style={{ animation: "dash-flow 1.5s linear infinite", animationDirection: "reverse" }}
                />
                <text x="250" y="225" textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="500">
                  {t("integrations_strip.diagram_data_inbound", "Services · Reports")}
                </text>

                {/* Sync icon circle — gentle pulse */}
                <circle
                  cx="250" cy="140" r="26"
                  className="fill-primary/10 stroke-primary"
                  strokeWidth="2.5"
                  style={{ animation: "gentle-pulse 3s ease-in-out infinite" }}
                />
                <path d="M242 134a10 10 0 0 1 16 0M258 146a10 10 0 0 1-16 0" className="stroke-primary" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M258 134l-2-4 4 2z" className="fill-primary" />
                <path d="M242 146l2 4-4-2z" className="fill-primary" />

                {/* Two-way sync label */}
                <text x="250" y="240" textAnchor="middle" className="fill-primary" fontSize="11" fontWeight="700" letterSpacing="0.05em">
                  {t("integrations_strip.diagram_sync_label", "TWO-WAY SYNC")}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </EditableBackground>
  );
}
