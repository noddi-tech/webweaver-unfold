import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main>
        <Hero />
        <Metrics />
        <Features useSectionBg={false} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
