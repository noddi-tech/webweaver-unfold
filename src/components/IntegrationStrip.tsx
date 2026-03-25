import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function IntegrationStrip() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const onSave = () => setRefreshKey((k) => k + 1);

  const techItems = ["REST API", "Webhooks", "Custom integrations", "CSV / JSON export"];

  return (
    <section
      ref={ref as React.RefObject<HTMLDivElement>}
      className="py-16 md:py-24 bg-muted/30 border-y border-border/40"
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

            {/* Partner logo placeholder */}
            <div className="flex items-center gap-3">
              <div className="border border-border rounded-md px-4 py-2 text-sm font-medium text-foreground bg-card">
                Eontyre
              </div>
              <span className="text-sm text-muted-foreground/60">+ more coming</span>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2">
              {techItems.map((item) => (
                <Badge key={item} variant="outline" className="text-sm px-3 py-1">
                  {item}
                </Badge>
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
              viewBox="0 0 480 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-md"
              role="img"
              aria-label="Integration diagram showing data flowing between your system and Navio"
            >
              {/* Left box — Your system */}
              <rect
                x="10"
                y="60"
                width="160"
                height="160"
                rx="12"
                className="fill-card stroke-border"
                strokeWidth="1.5"
              />
              <text
                x="90"
                y="128"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="15"
                fontWeight="600"
              >
                Your system
              </text>
              <text
                x="90"
                y="152"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="11"
              >
                Eontyre, ERP, CRM…
              </text>

              {/* Right box — Navio */}
              <rect
                x="310"
                y="60"
                width="160"
                height="160"
                rx="12"
                className="fill-primary"
              />
              <text
                x="390"
                y="128"
                textAnchor="middle"
                className="fill-primary-foreground"
                fontSize="15"
                fontWeight="600"
              >
                Navio
              </text>
              <text
                x="390"
                y="152"
                textAnchor="middle"
                className="fill-primary-foreground"
                fontSize="11"
                opacity="0.8"
              >
                Booking · Routing · Capacity
              </text>

              {/* Top arrow → right */}
              <line
                x1="175"
                y1="115"
                x2="305"
                y2="115"
                className="stroke-primary"
                strokeWidth="1.5"
                markerEnd="url(#arrowRight)"
              />
              <text
                x="240"
                y="107"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="10"
              >
                Bookings · Customers
              </text>

              {/* Bottom arrow ← left */}
              <line
                x1="305"
                y1="165"
                x2="175"
                y2="165"
                className="stroke-primary"
                strokeWidth="1.5"
                markerEnd="url(#arrowLeft)"
              />
              <text
                x="240"
                y="185"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="10"
              >
                Services · Reports
              </text>

              {/* Sync icon circle */}
              <circle
                cx="240"
                cy="140"
                r="16"
                className="fill-background stroke-primary"
                strokeWidth="1.5"
              />
              {/* Sync arrows inside circle */}
              <path
                d="M234 136a7 7 0 0 1 12 0M246 144a7 7 0 0 1-12 0"
                className="stroke-primary"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Small arrowheads on sync */}
              <path d="M246 136l-1.5-3 3 1.5z" className="fill-primary" />
              <path d="M234 144l1.5 3-3-1.5z" className="fill-primary" />

              {/* Arrowhead markers */}
              <defs>
                <marker
                  id="arrowRight"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0 0 L8 4 L0 8 Z" className="fill-primary" />
                </marker>
                <marker
                  id="arrowLeft"
                  markerWidth="8"
                  markerHeight="8"
                  refX="1"
                  refY="4"
                  orient="auto"
                >
                  <path d="M8 0 L0 4 L8 8 Z" className="fill-primary" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
