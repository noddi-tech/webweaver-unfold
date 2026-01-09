import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";

interface StickyApplyCTAProps {
  jobTitle: string;
  applicationUrl?: string | null;
  applicationEmail?: string | null;
  showAfterPx?: number;
}

export function StickyApplyCTA({ 
  jobTitle, 
  applicationUrl, 
  applicationEmail,
  showAfterPx = 600 
}: StickyApplyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useAppTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterPx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterPx]);

  const handleApply = () => {
    if (applicationUrl) {
      window.open(applicationUrl, "_blank", "noopener,noreferrer");
    } else if (applicationEmail) {
      window.location.href = `mailto:${applicationEmail}`;
    }
  };

  if (!applicationUrl && !applicationEmail) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg"
        >
          <div className="container mx-auto px-6 py-4 max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {t("careers.job.applyingFor", "Applying for")}
                </p>
                <p className="font-semibold text-foreground truncate">
                  {jobTitle}
                </p>
              </div>
              <Button size="lg" onClick={handleApply} className="shrink-0 group">
                {applicationEmail && !applicationUrl ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {t("careers.jobs.apply", "Apply Now")}
                  </>
                ) : (
                  <>
                    {t("careers.jobs.apply", "Apply Now")}
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
