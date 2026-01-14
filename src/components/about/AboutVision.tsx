import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { Sparkles } from "lucide-react";

export function AboutVision() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20 md:py-28" data-header-color="dark">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Our Vision</span>
          </div>

          <blockquote className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl text-primary/20 font-serif">
              "
            </div>
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-medium">
              <EditableTranslation
                translationKey="about.vision.quote"
                fallbackText="We envision a future where mobile services are standard, not niche — where operators have the tools, insights, and flexibility to serve customers anywhere, and where technology amplifies human craftsmanship rather than slowing it down."
              >
                We envision a future where mobile services are standard, not niche — where operators have the tools, insights, and flexibility to serve customers anywhere, and where technology amplifies human craftsmanship rather than slowing it down.
              </EditableTranslation>
            </p>
          </blockquote>

          <p className="mt-8 text-lg text-primary font-semibold">
            <EditableTranslation
              translationKey="about.vision.tagline"
              fallbackText="Navio is building that future."
            >
              Navio is building that future.
            </EditableTranslation>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
