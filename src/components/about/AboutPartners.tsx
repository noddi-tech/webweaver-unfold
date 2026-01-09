import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const partners = [
  {
    name: "Hurtigruta Carglass",
    descKey: "about.partners.hurtigruta.desc",
    descFallback: "Signed expansion agreement for Norway after successful pilot",
  },
  {
    name: "Trøndedekk",
    descKey: "about.partners.trondedekk.desc",
    descFallback: "Operational partner leveraging Navio for regional service delivery",
  },
  {
    name: "Noddi Automotive AS",
    descKey: "about.partners.noddi.desc",
    descFallback: "Licensor of Navio as both operator and technology partner",
  },
];

export function AboutPartners() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="partners" className="py-20 md:py-28">
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
              className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
              <p className="text-muted-foreground text-sm">
                <EditableTranslation
                  translationKey={partner.descKey}
                  fallbackText={partner.descFallback}
                >
                  {partner.descFallback}
                </EditableTranslation>
              </p>
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
