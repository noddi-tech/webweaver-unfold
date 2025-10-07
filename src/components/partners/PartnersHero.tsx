import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PartnersHero() {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Trusted by those who keep the world moving.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            20,000+ bookings and counting — powered by one platform.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 group" asChild>
            <Link to="/contact">
              Become a partner
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
