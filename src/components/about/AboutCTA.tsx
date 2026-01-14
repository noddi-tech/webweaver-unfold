import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Presentation, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function AboutCTA() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/5" data-header-color="dark">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <EditableTranslation
              translationKey="about.cta.title"
              fallbackText="Get in Touch"
            >
              Get in Touch
            </EditableTranslation>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            <EditableTranslation
              translationKey="about.cta.subtitle"
              fallbackText="Interested in how Navio can power your service operations?"
            >
              Interested in how Navio can power your service operations?
            </EditableTranslation>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact us
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/contact?demo=true">
                <Presentation className="w-4 h-4 mr-2" />
                Request a demo
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/partners">
                <Users className="w-4 h-4 mr-2" />
                Partner with Navio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
