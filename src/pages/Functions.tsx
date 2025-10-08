import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FunctionsHero from "@/components/functions/FunctionsHero";
import CoreLoop from "@/components/functions/CoreLoop";
import FunctionCards from "@/components/functions/FunctionCards";
import FunctionsCTA from "@/components/functions/FunctionsCTA";

export default function Functions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
        <Header />
        <main>
          <FunctionsHero />
          <CoreLoop />
          <FunctionCards />
          <FunctionsCTA />
        </main>
        <Footer />
    </div>
  );
}
