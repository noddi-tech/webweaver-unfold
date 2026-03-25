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
              viewBox="0 0 500 310"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-md"
              role="img"
              aria-label="Integration diagram showing two-way data sync between your system and Navio"
            >
              {/* Left box — Your system */}
              <rect
                x="10"
                y="60"
                width="160"
                height="160"
                rx="12"
                className="fill-card stroke-foreground/20"
                strokeWidth="2"
              />
              <text
                x="90"
                y="128"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="17"
                fontWeight="700"
              >
                Your system
              </text>
              <text
                x="90"
                y="152"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="12"
                opacity="0.6"
              >
                Eontyre, ERP, CRM…
              </text>

              {/* Right box — Navio */}
              <rect
                x="330"
                y="60"
                width="160"
                height="160"
                rx="12"
                className="fill-primary"
              />
              <text
                x="410"
                y="128"
                textAnchor="middle"
                className="fill-primary-foreground"
                fontSize="17"
                fontWeight="700"
              >
                Navio
              </text>
              <text
                x="410"
                y="152"
                textAnchor="middle"
                className="fill-primary-foreground"
                fontSize="12"
                opacity="0.8"
              >
                Booking · Routing · Capacity
              </text>

              {/* Top arrow → right */}
              <line
                x1="175"
                y1="115"
                x2="220"
                y2="115"
                className="stroke-primary"
                strokeWidth="2"
                markerEnd="url(#arrowRight)"
              />
              <line
                x1="280"
                y1="115"
                x2="325"
                y2="115"
                className="stroke-primary"
                strokeWidth="2"
                markerEnd="url(#arrowRight)"
              />
              <text
                x="250"
                y="100"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="12"
                fontWeight="500"
              >
                Bookings · Customers
              </text>

              {/* Bottom arrow ← left */}
              <line
                x1="325"
                y1="165"
                x2="280"
                y2="165"
                className="stroke-primary"
                strokeWidth="2"
                markerEnd="url(#arrowLeft)"
              />
              <line
                x1="220"
                y1="165"
                x2="175"
                y2="165"
                className="stroke-primary"
                strokeWidth="2"
                markerEnd="url(#arrowLeft)"
              />
              <text
                x="250"
                y="192"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="12"
                fontWeight="500"
              >
                Services · Reports
              </text>

              {/* Sync icon circle — prominent */}
              <circle
                cx="250"
                cy="140"
                r="26"
                className="fill-primary/10 stroke-primary"
                strokeWidth="2.5"
              />
              {/* Sync arrows inside circle */}
              <path
                d="M242 134a10 10 0 0 1 16 0M258 146a10 10 0 0 1-16 0"
                className="stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Small arrowheads on sync */}
              <path d="M258 134l-2-4 4 2z" className="fill-primary" />
              <path d="M242 146l2 4-4-2z" className="fill-primary" />

              {/* Two-way sync label */}
              <text
                x="250"
                y="218"
                textAnchor="middle"
                className="fill-primary"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                TWO-WAY SYNC
              </text>

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
