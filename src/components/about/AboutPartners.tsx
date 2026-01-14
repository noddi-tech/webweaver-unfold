import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const partners = [
  {
    name: "Hurtigruta Carglass",
    logoUrl: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/1764063455041-carglass%20logo.png",
    logoAlt: "Hurtigruta Carglass logo",
    descKey: "about.partners.hurtigruta.desc",
    descFallback: "Signed expansion agreement for Norway after successful pilot",
  },
  {
    name: "Trøndedekk",
    logoUrl: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/1764063503770-Tronderdekk%20logo.png",
    logoAlt: "Trøndedekk logo",
    descKey: "about.partners.trondedekk.desc",
    descFallback: "Operational partner leveraging Navio for regional service delivery",
  },
  {
    name: "Noddi Automotive AS",
    logoUrl: "https://ouhfgazomdmirdazvjys.supabase.co/storage/v1/object/public/site-images/Library/1764063447901-Noddi.png",
    logoAlt: "Noddi Automotive logo",
    descKey: "about.partners.noddi.desc",
    descFallback: "Licensor of Navio as both operator and technology partner",
  },
];

export function AboutPartners() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="partners" className="py-20 md:py-28" data-header-color="dark">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <EditableTranslation
              translationKey="about.partners.title"
              fallbackText="Our Partners"
            >
              Our Partners
            </EditableTranslation>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <EditableTranslation
              translationKey="about.partners.subtitle"
              fallbackText="Navio is trusted by a growing network of operators who see the same opportunity: better technology unlocks better service."
            >
              Navio is trusted by a growing network of operators who see the same opportunity: better technology unlocks better service.
            </EditableTranslation>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <EditableCard
                elementIdPrefix={`about-partner-${index}`}
                defaultBackground="bg-card"
                defaultTextColor="card-foreground"
                defaultIconColor="card-foreground"
                defaultIconBackground="bg-card-foreground/10"
                className="p-6 border hover:shadow-md transition-shadow h-full"
              >
                {/* Partner Logo */}
                <div className="h-16 flex items-center justify-center mb-4">
                  <div className="bg-white/90 rounded-lg px-4 py-2 h-14 flex items-center justify-center">
                    <img
                      src={partner.logoUrl}
                      alt={partner.logoAlt}
                      className="max-h-10 max-w-[140px] object-contain"
                    />
                  </div>
                </div>
                <EditableCardTitle className="text-lg font-semibold mb-2 text-center">
                  {partner.name}
                </EditableCardTitle>
                <EditableCardDescription muted className="text-sm text-center">
                  <EditableTranslation
                    translationKey={partner.descKey}
                    fallbackText={partner.descFallback}
                  >
                    {partner.descFallback}
                  </EditableTranslation>
                </EditableCardDescription>
              </EditableCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Button asChild variant="outline">
            <Link to="/partners">
              View Partner Stories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
