import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { Counter } from "@/components/ui/counter";
import { Calendar, ThumbsUp, Zap, TrendingUp } from "lucide-react";

const metrics = [
  {
    icon: Calendar,
    value: 25000,
    suffix: "+",
    labelKey: "about.metrics.bookings.label",
    labelFallback: "Bookings Processed",
    contextKey: "about.metrics.bookings.context",
    contextFallback: "Proven at scale",
  },
  {
    icon: ThumbsUp,
    value: 90,
    suffix: "",
    labelKey: "about.metrics.nps.label",
    labelFallback: "Net Promoter Score",
    contextKey: "about.metrics.nps.context",
    contextFallback: "Industry-leading satisfaction",
  },
  {
    icon: Zap,
    value: 1,
    prefix: "<",
    suffix: " sec",
    labelKey: "about.metrics.admin.label",
    labelFallback: "Admin Time Per Booking",
    contextKey: "about.metrics.admin.context",
    contextFallback: "Radically efficient workflows",
  },
  {
    icon: TrendingUp,
    value: 50,
    prefix: "30-",
    suffix: "%",
    labelKey: "about.metrics.margin.label",
    labelFallback: "Margin Per Booking",
    contextKey: "about.metrics.margin.context",
    contextFallback: "Improved economics for operators",
  },
];

export function AboutMetrics() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="metrics" className="py-20 md:py-28 bg-muted/30">
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
              translationKey="about.metrics.title"
              fallbackText="By the Numbers"
            >
              By the Numbers
            </EditableTranslation>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <EditableTranslation
              translationKey="about.metrics.subtitle"
              fallbackText="Navio isn't just a concept — it's been proven in market through real performance."
            >
              Navio isn't just a concept — it's been proven in market through real performance.
            </EditableTranslation>
          </p>
        </motion.div>

        {/* Mobile: Horizontal Scroll Snap */}
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 w-max">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-center w-[70vw] max-w-[280px] shrink-0"
              >
                <EditableCard
                  elementIdPrefix={`about-metrics-${index}`}
                  defaultBackground="bg-card"
                  defaultTextColor="card-foreground"
                  defaultIconColor="card-foreground"
                  defaultIconBackground="bg-card-foreground/10"
                  className="p-5 border shadow-sm text-center h-full active:scale-[0.98] transition-transform"
                >
                  <EditableCardIcon
                    icon={metric.icon}
                    size="default"
                    containerClassName="mx-auto mb-3"
                  />
                  <EditableCardTitle className="text-3xl font-bold mb-2">
                    {metric.prefix}
                    {isVisible && (
                      <Counter
                        end={metric.value}
                        duration={2}
                        suffix={metric.suffix}
                      />
                    )}
                  </EditableCardTitle>
                  <EditableCardTitle className="font-medium mb-1 text-sm">
                    <EditableTranslation
                      translationKey={metric.labelKey}
                      fallbackText={metric.labelFallback}
                    >
                      {metric.labelFallback}
                    </EditableTranslation>
                  </EditableCardTitle>
                  <EditableCardDescription muted className="text-xs">
                    <EditableTranslation
                      translationKey={metric.contextKey}
                      fallbackText={metric.contextFallback}
                    >
                      {metric.contextFallback}
                    </EditableTranslation>
                  </EditableCardDescription>
                </EditableCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <EditableCard
                elementIdPrefix={`about-metrics-${index}`}
                defaultBackground="bg-card"
                defaultTextColor="card-foreground"
                defaultIconColor="card-foreground"
                defaultIconBackground="bg-card-foreground/10"
                className="p-6 border shadow-sm text-center hover:shadow-md transition-shadow h-full"
              >
                <EditableCardIcon
                  icon={metric.icon}
                  size="default"
                  containerClassName="mx-auto mb-4"
                />
                <EditableCardTitle className="text-3xl md:text-4xl font-bold mb-2">
                  {metric.prefix}
                  {isVisible && (
                    <Counter
                      end={metric.value}
                      duration={2}
                      suffix={metric.suffix}
                    />
                  )}
                </EditableCardTitle>
                <EditableCardTitle className="font-medium mb-1 text-base">
                  <EditableTranslation
                    translationKey={metric.labelKey}
                    fallbackText={metric.labelFallback}
                  >
                    {metric.labelFallback}
                  </EditableTranslation>
                </EditableCardTitle>
                <EditableCardDescription muted className="text-sm">
                  <EditableTranslation
                    translationKey={metric.contextKey}
                    fallbackText={metric.contextFallback}
                  >
                    {metric.contextFallback}
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
