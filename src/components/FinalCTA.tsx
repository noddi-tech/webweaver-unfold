import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Let's build your digital workshop
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Schedule a personalized demo or see how your specific use case can be automated with Noddi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6 group" asChild>
                <Link to="/contact">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link to="/architecture">
                  See Technical Overview
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              No credit card required • Free consultation • See results in 30 days
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
