import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";
import { EditableCardIcon } from "@/components/EditableCardIcon";
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

        {/* Timeline Visual Connector - Desktop */}
        <div className="hidden md:block relative mb-8">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute top-1/2 left-[16.67%] right-[16.67%] h-0.5 bg-primary/30 -translate-y-1/2 origin-left"
          />
          <div className="flex justify-between px-[calc(16.67%-1.25rem)]">
            {milestones.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.15 }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg z-10"
              >
                {index + 1}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Mobile Timeline - Vertical */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20" />
          
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
              className="relative pl-10 md:pl-0"
            >
              {/* Mobile Timeline Dot */}
              <div className="md:hidden absolute left-4 top-6 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold -translate-x-1/2 z-10">
                {index + 1}
              </div>
              
              <EditableCard
                elementIdPrefix={`about-story-${index}`}
                defaultBackground="bg-card"
                defaultTextColor="card-foreground"
                defaultIconColor="card-foreground"
                defaultIconBackground="bg-card-foreground/10"
                className="p-6 border shadow-sm h-full"
              >
                <EditableCardIcon
                  icon={milestone.icon}
                  size="lg"
                  containerClassName="mx-auto mb-4"
                />
                <EditableCardTitle className="text-lg font-semibold text-center mb-3">
                  <EditableTranslation
                    translationKey={milestone.titleKey}
                    fallbackText={milestone.titleFallback}
                  >
                    {milestone.titleFallback}
                  </EditableTranslation>
                </EditableCardTitle>
                <EditableCardDescription muted className="text-center text-sm">
                  <EditableTranslation
                    translationKey={milestone.descKey}
                    fallbackText={milestone.descFallback}
                  >
                    {milestone.descFallback}
                  </EditableTranslation>
                </EditableCardDescription>
              </EditableCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
