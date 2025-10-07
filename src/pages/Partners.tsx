import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnersHero from "@/components/partners/PartnersHero";
import ProofMetrics from "@/components/partners/ProofMetrics";
import CaseStudies from "@/components/partners/CaseStudies";
import PartnershipModel from "@/components/partners/PartnershipModel";

export default function Partners() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <PartnersHero />
          <ProofMetrics />
          <CaseStudies />
          <PartnershipModel />
        </main>
        <Footer />
    </div>
  );
}
