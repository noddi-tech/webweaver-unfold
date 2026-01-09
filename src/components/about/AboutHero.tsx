import { motion } from "framer-motion";
import { EditableTranslation } from "@/components/EditableTranslation";

export function AboutHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <EditableTranslation
              translationKey="about.hero.headline"
              fallbackText="Navio transforms how automotive services are delivered"
              className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text"
            >
              Navio transforms how automotive services are delivered
            </EditableTranslation>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            <EditableTranslation
              translationKey="about.hero.subheadline"
              fallbackText="We build the software that makes mobile automotive services work — not just in theory, but in real life."
            >
              We build the software that makes mobile automotive services work — not just in theory, but in real life.
            </EditableTranslation>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            <EditableTranslation
              translationKey="about.hero.intro"
              fallbackText="Navio was born from a simple reality: there was no good tool for managing field service delivery at scale — so we built one ourselves."
            >
              Navio was born from a simple reality: there was no good tool for managing field service delivery at scale — so we built one ourselves.
            </EditableTranslation>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
