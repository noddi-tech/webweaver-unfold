import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { Code, Wrench, Rocket } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

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

        {/* Mobile Swipeable Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{ align: "start" }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {milestones.map((milestone, index) => (
                <CarouselItem key={index} className="pl-3 basis-[85%]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EditableCard
                      elementIdPrefix={`about-story-${index}`}
                      defaultBackground="bg-card"
                      defaultTextColor="card-foreground"
                      defaultIconColor="card-foreground"
                      defaultIconBackground="bg-card-foreground/10"
                      className="p-5 border shadow-sm h-full active:scale-[0.98] transition-transform touch-pan-x"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <EditableCardIcon
                          icon={milestone.icon}
                          size="default"
                        />
                      </div>
                      <EditableCardTitle className="text-lg font-semibold mb-3">
                        <EditableTranslation
                          translationKey={milestone.titleKey}
                          fallbackText={milestone.titleFallback}
                        >
                          {milestone.titleFallback}
                        </EditableTranslation>
                      </EditableCardTitle>
                      <EditableCardDescription muted className="text-sm">
                        <EditableTranslation
                          translationKey={milestone.descKey}
                          fallbackText={milestone.descFallback}
                        >
                          {milestone.descFallback}
                        </EditableTranslation>
                      </EditableCardDescription>
                    </EditableCard>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {milestones.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  current === index
                    ? "bg-primary w-6"
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Timeline Visual Connector */}
          <div className="relative mb-8">
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
          <div className="grid md:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
              >
                <EditableCard
                  elementIdPrefix={`about-story-${index}`}
                  defaultBackground="bg-card"
                  defaultTextColor="card-foreground"
                  defaultIconColor="card-foreground"
                  defaultIconBackground="bg-card-foreground/10"
                  className="p-6 border shadow-sm h-full hover:shadow-md transition-shadow"
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
      </div>
    </section>
  );
}