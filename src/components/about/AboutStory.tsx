import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { Code, Wrench, Rocket } from "lucide-react";

const milestones = [
  {
    icon: Wrench,
    titleKey: "about.story.milestone1.title",
    titleFallback: "Started by doing the work",
    descKey: "about.story.milestone1.desc",
    descFallback: "For three years, we operated Noddi Automotive AS — running mobile services for customers across Norway.",
  },
  {
    icon: Code,
    titleKey: "about.story.milestone2.title",
    titleFallback: "Discovered the limitations",
    descKey: "about.story.milestone2.desc",
    descFallback: "Existing tools weren't built for mobile-first operations, couldn't handle complex routing or real-time coordination.",
  },
  {
    icon: Rocket,
    titleKey: "about.story.milestone3.title",
    titleFallback: "Built something better",
    descKey: "about.story.milestone3.desc",
    descFallback: "Navio combines intelligent planning, automated execution, and real-time visibility into one platform.",
  },
];

export function AboutStory() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="story" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <EditableTranslation
              translationKey="about.story.title"
              fallbackText="Our Story"
            >
              Our Story
            </EditableTranslation>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto italic">
            <EditableTranslation
              translationKey="about.story.quote"
              fallbackText="Most software companies start by writing code. Navio started by doing the work."
            >
              Most software companies start by writing code. Navio started by doing the work.
            </EditableTranslation>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Timeline connector for desktop */}
              {index < milestones.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
              )}
              
              <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <milestone.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-3">
                  <EditableTranslation
                    translationKey={milestone.titleKey}
                    fallbackText={milestone.titleFallback}
                  >
                    {milestone.titleFallback}
                  </EditableTranslation>
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  <EditableTranslation
                    translationKey={milestone.descKey}
                    fallbackText={milestone.descFallback}
                  >
                    {milestone.descFallback}
                  </EditableTranslation>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
