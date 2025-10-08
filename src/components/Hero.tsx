import { Button } from "@/components/ui/button";
import { ArrowRight, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import { useState } from "react";
import { Counter } from "@/components/ui/counter";
import { useTypography } from "@/hooks/useTypography";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { h1, body } = useTypography();

  return (
    <section className="py-section relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <h1 className={`${h1} text-foreground`}>
              One platform. Every function.
            </h1>

            <p className={`${body} text-muted-foreground`}>
              Booking to billing. Built for automotive services.
            </p>

            {/* Metrics Badges */}
            <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-card shadow-lg hover-scale">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    NPS <Counter end={90} prefix="~" />
                  </div>
                  <div className="text-xs text-muted-foreground">Industry leading</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-card shadow-lg hover-scale">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    <Counter end={20000} suffix="+" />
                  </div>
                  <div className="text-xs text-muted-foreground">Bookings completed</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <Link to="/contact">
                <Button size="lg" className="text-lg px-8 py-4 group shadow-lg">
                  Get a Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative glass-card rounded-2xl p-6 shadow-2xl">
              {!imageLoaded && (
                <div className="w-full aspect-video rounded-xl bg-muted animate-pulse" />
              )}
              <img
                src={dashboardPreview}
                alt="Noddi Tech Dashboard - Unified booking and ERP system"
                className={`w-full rounded-xl shadow-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-6'}`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
