import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Text */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Streamline Your
            <br />
            Automotive Operations
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Noddi Tech empowers automotive maintenance providers with intelligent logistics 
            technology to optimize operations, reduce costs, and deliver exceptional service.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="glass-card text-lg px-8 py-4">
              <Play className="mr-2" size={20} />
              Watch Demo
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="glass-card rounded-2xl p-6 shadow-2xl">
            <img
              src={dashboardPreview}
              alt="Noddi Tech Dashboard Preview"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;