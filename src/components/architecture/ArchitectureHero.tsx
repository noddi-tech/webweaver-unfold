import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTypography } from "@/hooks/useTypography";

export default function ArchitectureHero() {
  const { h1, body } = useTypography();
  
  return (
    <section className="py-section bg-hero">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className={`${h1} mb-6 text-foreground`}>
            One data model. One brain. Real-time everything.
          </h1>
          <p className={`${body} text-muted-foreground mb-8`}>
            Noddi runs backend and frontend in perfect sync — because they're the same thing.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 group" asChild>
            <Link to="/contact">
              Book a technical demo
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
