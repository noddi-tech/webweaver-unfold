import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useTypography } from "@/hooks/useTypography";

export default function ArchitectureCTA() {
  const { h2 } = useTypography();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className={`${h2} mb-6 text-foreground`}>
            See the logic in motion.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <Link to="/contact">
                Book a technical demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link to="/contact">
                <FileText className="w-5 h-5 mr-2" />
                Request docs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
