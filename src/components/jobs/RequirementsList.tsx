import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseJobMarkdown } from "@/lib/markdownUtils";

interface RequirementsListProps {
  requirements: string | null;
  className?: string;
}

export function RequirementsList({ requirements, className = "" }: RequirementsListProps) {
  const [showNiceToHave, setShowNiceToHave] = useState(false);
  const { t } = useAppTranslation();

  if (!requirements) return null;

  // Split requirements into required and nice-to-have
  const lines = requirements.split('\n').filter(line => line.trim());
  const requiredItems: string[] = [];
  const niceToHaveItems: string[] = [];
  let isNiceToHave = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    // Check if this line indicates "nice to have" section
    if (trimmed.toLowerCase().includes('nice to have') || 
        trimmed.toLowerCase().includes('bonus') ||
        trimmed.toLowerCase().includes('preferred')) {
      isNiceToHave = true;
      return;
    }
    // Check if it's a list item
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const item = trimmed.replace(/^[-•*]\s*/, '');
      if (isNiceToHave) {
        niceToHaveItems.push(item);
      } else {
        requiredItems.push(item);
      }
    }
  });

  // If no structured items, use the raw content
  const hasStructuredItems = requiredItems.length > 0;

  return (
    <section id="requirements" className={`scroll-mt-24 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          {t("careers.job.requirements", "Requirements")}
        </h2>

        {hasStructuredItems ? (
          <>
            {/* Required items */}
            <ul className="space-y-3 mb-6">
              {requiredItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* Nice to have section */}
            {niceToHaveItems.length > 0 && (
              <div className="mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNiceToHave(!showNiceToHave)}
                  className="text-muted-foreground mb-4 -ml-2"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-brand-orange" />
                  {t("careers.job.niceToHave", "Nice to Have")} ({niceToHaveItems.length})
                  {showNiceToHave ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>

                <AnimatePresence>
                  {showNiceToHave && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {niceToHaveItems.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3 text-brand-orange" />
                          </div>
                          <span className="text-muted-foreground leading-relaxed">{item}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        ) : (
          // Fallback to raw content
          <div 
            className="prose prose-lg max-w-none text-muted-foreground [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li]:mb-3 [&_li:before]:content-['✓'] [&_li:before]:text-primary [&_li:before]:font-bold"
            dangerouslySetInnerHTML={{ __html: parseJobMarkdown(requirements) }}
          />
        )}
      </motion.div>
    </section>
  );
}
