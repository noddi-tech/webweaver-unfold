import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import { useHeadings } from "@/hooks/useHeadings";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  const { getHeading } = useHeadings('index', 'hero');
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main>
        <Hero />
        <Metrics />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
