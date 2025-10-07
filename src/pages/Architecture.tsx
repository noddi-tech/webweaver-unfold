import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArchitectureHero from "@/components/architecture/ArchitectureHero";
import ArchitectureDiagram from "@/components/architecture/ArchitectureDiagram";
import ArchitecturePrinciples from "@/components/architecture/ArchitecturePrinciples";
import IntegrationOverview from "@/components/architecture/IntegrationOverview";
import ArchitectureCTA from "@/components/architecture/ArchitectureCTA";

export default function Architecture() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <ArchitectureHero />
          <ArchitectureDiagram />
          <ArchitecturePrinciples />
          <IntegrationOverview />
          <ArchitectureCTA />
        </main>
        <Footer />
    </div>
  );
}
