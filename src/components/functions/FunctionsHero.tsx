import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";

export default function FunctionsHero() {
  const { h1, body } = useTypography();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className={`${h1} mb-6 text-foreground`}>
            Every function. One platform.
          </h1>
          <p className={`${body} text-muted-foreground mb-8`}>
            From booking to billing, everything connects — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                Book a demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <LanguageLink to="/architecture">
                <Eye className="w-5 h-5 mr-2" />
                See how the system thinks
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
