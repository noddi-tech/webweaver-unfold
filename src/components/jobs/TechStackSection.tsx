import { motion } from "framer-motion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TechStackItem {
  name: string;
  logo_url?: string;
  category: string;
  description?: string;
}

interface TechStackSectionProps {
  techStack: TechStackItem[];
}

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  infrastructure: "Infrastructure",
  tools: "Tools & Workflow",
  general: "Other",
};

const categoryOrder = ["frontend", "backend", "infrastructure", "tools", "general"];

export function TechStackSection({ techStack }: TechStackSectionProps) {
  const { t } = useAppTranslation();

  if (!techStack || techStack.length === 0) return null;

  // Group by category
  const groupedStack = techStack.reduce((acc, item) => {
    const category = item.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, TechStackItem[]>);

  // Sort categories
  const sortedCategories = categoryOrder.filter(cat => groupedStack[cat]);

  return (
    <section id="tech-stack" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("careers.job.techStack", "Tech Stack")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("careers.job.techStackDesc", "Technologies you'll be working with")}
        </p>

        <TooltipProvider>
          <div className="space-y-8">
            {sortedCategories.map((category, catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: catIndex * 0.1 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  {categoryLabels[category] || category}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {groupedStack[category].map((tech, index) => (
                    <Tooltip key={index} delayDuration={200}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default"
                        >
                          {tech.logo_url ? (
                            <img
                              src={tech.logo_url}
                              alt={tech.name}
                              className="w-5 h-5 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {tech.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {tech.name}
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      {tech.description && (
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm">{tech.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </TooltipProvider>
      </motion.div>
    </section>
  );
}
