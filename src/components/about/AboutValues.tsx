import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { Lightbulb, Shield, Handshake } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    titleKey: "about.values.innovation.title",
    titleFallback: "Innovation",
    descKey: "about.values.innovation.desc",
    descFallback: "We push boundaries to build better solutions — not incremental fixes.",
  },
  {
    icon: Shield,
    titleKey: "about.values.trust.title",
    titleFallback: "Trust",
    descKey: "about.values.trust.desc",
    descFallback: "We design for reliability, transparency, and operational confidence.",
  },
  {
    icon: Handshake,
    titleKey: "about.values.partnership.title",
    titleFallback: "Partnership",
    descKey: "about.values.partnership.desc",
    descFallback: "We succeed when our partners and customers succeed.",
  },
];

const whyFeatures = [
  { key: "about.whyMatters.feature1", fallback: "Intelligent sequencing and routing" },
  { key: "about.whyMatters.feature2", fallback: "Real-time field coordination" },
  { key: "about.whyMatters.feature3", fallback: "Adaptive workflows" },
  { key: "about.whyMatters.feature4", fallback: "Deep integration with operations" },
];

export function AboutValues() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="values" className="py-20 md:py-28 bg-muted/30">
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
              translationKey="about.values.title"
              fallbackText="Our Values"
            >
              Our Values
            </EditableTranslation>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card rounded-xl p-8 border shadow-sm text-center hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <EditableTranslation
                  translationKey={value.titleKey}
                  fallbackText={value.titleFallback}
                >
                  {value.titleFallback}
                </EditableTranslation>
              </h3>
              <p className="text-muted-foreground">
                <EditableTranslation
                  translationKey={value.descKey}
                  fallbackText={value.descFallback}
                >
                  {value.descFallback}
                </EditableTranslation>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Why Navio Matters subsection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-card rounded-2xl p-8 md:p-12 border"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">
            <EditableTranslation
              translationKey="about.whyMatters.title"
              fallbackText="Why Navio Matters"
            >
              Why Navio Matters
            </EditableTranslation>
          </h3>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            <EditableTranslation
              translationKey="about.whyMatters.intro"
              fallbackText="Mobile automotive services are not the same as workshop bookings. They require:"
            >
              Mobile automotive services are not the same as workshop bookings. They require:
            </EditableTranslation>
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            {whyFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">
                  <EditableTranslation
                    translationKey={feature.key}
                    fallbackText={feature.fallback}
                  >
                    {feature.fallback}
                  </EditableTranslation>
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-lg font-medium text-primary">
            <EditableTranslation
              translationKey="about.whyMatters.conclusion"
              fallbackText="Navio is the system that finally makes this manageable at scale — not through workarounds, but by design."
            >
              Navio is the system that finally makes this manageable at scale — not through workarounds, but by design.
            </EditableTranslation>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
