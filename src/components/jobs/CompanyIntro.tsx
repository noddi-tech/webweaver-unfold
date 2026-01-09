import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Building2, Users, Globe, ArrowRight } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface CompanyIntroProps {
  customIntro?: string | null;
}

export function CompanyIntro({ customIntro }: CompanyIntroProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useAppTranslation();

  const defaultIntro = t(
    "careers.job.companyIntro",
    "Navio is building the operating system for automotive services. We're on a mission to digitize and streamline how car service businesses operate, helping them deliver better customer experiences while growing their revenue."
  );

  const intro = customIntro || defaultIntro;

  const stats = [
    { icon: Building2, label: t("careers.job.stats.companies", "Companies"), value: "200+" },
    { icon: Users, label: t("careers.job.stats.team", "Team Size"), value: "50+" },
    { icon: Globe, label: t("careers.job.stats.countries", "Countries"), value: "5" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl bg-muted/50 border border-border p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {t("careers.job.aboutCompany", "About Navio")}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground"
        >
          {isExpanded ? (
            <>
              {t("common.showLess", "Show less")}
              <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              {t("common.showMore", "Show more")}
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-4">
        {intro}
      </p>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border my-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Learn more link */}
            <Link
              to={`/${i18n.language}/about`}
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
            >
              {t("careers.job.learnMore", "Learn more about us")}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
