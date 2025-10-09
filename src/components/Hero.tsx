import { Button } from "@/components/ui/button";
import { ArrowRight, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import bookingStep1 from "@/assets/booking-step-1-location.png";
import bookingStep2 from "@/assets/booking-step-2-car.png";
import bookingStep3 from "@/assets/booking-step-3-service.png";
import bookingStep4 from "@/assets/booking-step-4-time.png";
import bookingStep5 from "@/assets/booking-step-5-confirmation.png";
import { useState, useEffect, useRef } from "react";
import { Counter } from "@/components/ui/counter";
import { useTypography } from "@/hooks/useTypography";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Hero = () => {
  const { h1, body } = useTypography();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const plugin = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true })
  );

  const bookingSteps = [
    {
      image: bookingStep1,
      alt: "Noddi booking step 1 - Location selection screen for choosing service location",
      title: "Choose Location"
    },
    {
      image: bookingStep2,
      alt: "Noddi booking step 2 - Car selection and management screen",
      title: "Select Car"
    },
    {
      image: bookingStep3,
      alt: "Noddi booking step 3 - Service selection screen showing tire change and other options",
      title: "Choose Service"
    },
    {
      image: bookingStep4,
      alt: "Noddi booking step 4 - Time slot selection for booking appointment",
      title: "Pick Time"
    },
    {
      image: bookingStep5,
      alt: "Noddi booking step 5 - Booking confirmation screen with details",
      title: "Confirmation"
    }
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="py-section relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-[40%_60%] gap-8 items-center">
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

          {/* Right Column - Booking Flow Carousel */}
          <div className="relative max-w-2xl mx-auto">
            <Carousel
              setApi={setApi}
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {bookingSteps.map((step, index) => (
                  <CarouselItem key={index} className="pl-0">
                    <div className="flex items-center">
                      <img
                        src={step.image}
                        alt={step.alt}
                        className="w-full h-auto object-contain transition-opacity duration-500"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
            
            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current - 1
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
