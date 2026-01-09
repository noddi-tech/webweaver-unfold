import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { Clock, TrendingUp, Target } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    key: "about.mission.benefit1",
    fallback: "Spend less time on admin",
  },
  {
    icon: TrendingUp,
    key: "about.mission.benefit2",
    fallback: "Deliver more services with the same resources",
  },
  {
    icon: Target,
    key: "about.mission.benefit3",
    fallback: "Focus on quality and outcomes, not software workarounds",
  },
];

export function AboutMission() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="mission" className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <EditableTranslation
              translationKey="about.mission.title"
              fallbackText="Our Mission"
            >
              Our Mission
            </EditableTranslation>
          </h2>
          
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12 border mb-12">
            <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6">
              <EditableTranslation
                translationKey="about.mission.statement"
                fallbackText="To transform how automotive services are booked and delivered."
              >
                To transform how automotive services are booked and delivered.
              </EditableTranslation>
            </p>
            <p className="text-muted-foreground text-lg">
              <EditableTranslation
                translationKey="about.mission.description"
                fallbackText="We empower service operators and partners with seamless, reliable technology so they can:"
              >
                We empower service operators and partners with seamless, reliable technology so they can:
              </EditableTranslation>
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <EditableCard
                elementIdPrefix={`about-mission-benefit-${index}`}
                defaultBackground="bg-card"
                defaultTextColor="card-foreground"
                className="flex flex-col items-center p-6 border hover:shadow-md transition-shadow h-full"
              >
                <EditableCardIcon
                  icon={benefit.icon}
                  size="default"
                  containerClassName="mb-4"
                />
                <EditableCardTitle className="font-medium text-base text-center">
                  <EditableTranslation
                    translationKey={benefit.key}
                    fallbackText={benefit.fallback}
                  >
                    {benefit.fallback}
                  </EditableTranslation>
                </EditableCardTitle>
              </EditableCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
