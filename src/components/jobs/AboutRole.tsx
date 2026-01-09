import { useState } from "react";
import { motion } from "framer-motion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { parseJobMarkdown } from "@/lib/markdownUtils";

interface AboutRoleProps {
  description: string | null;
  maxPreviewLength?: number;
}

export function AboutRole({ description, maxPreviewLength = 800 }: AboutRoleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useAppTranslation();

  if (!description) return null;

  const isLong = description.length > maxPreviewLength;
  const displayContent = isExpanded || !isLong 
    ? description 
    : description.slice(0, maxPreviewLength) + "...";

  return (
    <section id="about" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          {t("careers.job.aboutRole", "About This Role")}
        </h2>
        
        <div className="relative">
          <div 
            className="prose prose-lg max-w-none text-muted-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: parseJobMarkdown(displayContent) }}
          />
          
          {/* Gradient fade for long content */}
          {!isExpanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>

        {isLong && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-primary hover:text-primary/80"
          >
            {isExpanded ? (
              <>
                {t("common.showLess", "Show less")}
                <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                {t("common.readMore", "Read more")}
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </motion.div>
    </section>
  );
}
