import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  exists: boolean;
}

interface JobNavigationProps {
  hasDescription: boolean;
  hasWorkAssignments: boolean;
  hasTechStack: boolean;
  hasRequirements: boolean;
  hasBenefits: boolean;
}

export function JobNavigation({
  hasDescription,
  hasWorkAssignments,
  hasTechStack,
  hasRequirements,
  hasBenefits,
}: JobNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>("about");
  const [isSticky, setIsSticky] = useState(false);
  const { t } = useAppTranslation();

  const navigationItems: NavigationItem[] = [
    { id: "about", label: t("careers.job.nav.about", "About Role"), exists: hasDescription },
    { id: "work-assignments", label: t("careers.job.nav.work", "Work"), exists: hasWorkAssignments },
    { id: "tech-stack", label: t("careers.job.nav.tech", "Tech Stack"), exists: hasTechStack },
    { id: "requirements", label: t("careers.job.nav.requirements", "Requirements"), exists: hasRequirements },
    { id: "benefits", label: t("careers.job.nav.benefits", "Benefits"), exists: hasBenefits },
  ].filter(item => item.exists);

  useEffect(() => {
    const handleScroll = () => {
      // Check if nav should be sticky
      const navElement = document.getElementById("job-navigation");
      if (navElement) {
        const rect = navElement.getBoundingClientRect();
        setIsSticky(rect.top <= 80);
      }

      // Determine active section
      const sections = navigationItems.map(item => item.id);
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigationItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  if (navigationItems.length < 2) return null;

  return (
    <div
      id="job-navigation"
      className={cn(
        "transition-all duration-300 z-40",
        isSticky ? "sticky top-20" : ""
      )}
    >
      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center gap-1 p-1.5 rounded-xl bg-muted/80 backdrop-blur-sm border border-border overflow-x-auto scrollbar-hide"
      >
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              activeSection === item.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeSection === item.id && (
              <motion.div
                layoutId="active-section"
                className="absolute inset-0 bg-primary rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </motion.nav>
    </div>
  );
}
