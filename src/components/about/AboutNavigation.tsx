import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const sections = [
  { id: "story", labelKey: "about.nav.story", fallback: "Our Story" },
  { id: "mission", labelKey: "about.nav.mission", fallback: "Mission" },
  { id: "metrics", labelKey: "about.nav.metrics", fallback: "By the Numbers" },
  { id: "partners", labelKey: "about.nav.partners", fallback: "Partners" },
  { id: "values", labelKey: "about.nav.values", fallback: "Values" },
  { id: "team", labelKey: "about.nav.team", fallback: "Team" },
];

export function AboutNavigation() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("story");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Make sticky after scrolling past hero (approx 400px)
      setIsSticky(window.scrollY > 400);

      // Find active section based on scroll position
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`w-full z-40 transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 bg-background/95 backdrop-blur-md border-b shadow-sm"
          : "relative bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-full"
            >
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  activeSection === section.id
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(section.labelKey, section.fallback)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
