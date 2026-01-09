import { motion } from "framer-motion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { parseJobMarkdown } from "@/lib/markdownUtils";
import { 
  DollarSign, 
  TrendingUp, 
  Home, 
  GraduationCap, 
  Heart, 
  Coffee, 
  Plane, 
  Users,
  Laptop,
  Clock
} from "lucide-react";

interface BenefitsGridProps {
  benefits: string | null;
}

// Map common benefit keywords to icons
const benefitIcons: Record<string, React.ElementType> = {
  salary: DollarSign,
  compensation: DollarSign,
  equity: TrendingUp,
  stock: TrendingUp,
  remote: Home,
  flexible: Home,
  learning: GraduationCap,
  education: GraduationCap,
  development: GraduationCap,
  health: Heart,
  insurance: Heart,
  medical: Heart,
  coffee: Coffee,
  snacks: Coffee,
  lunch: Coffee,
  travel: Plane,
  vacation: Plane,
  holiday: Plane,
  team: Users,
  culture: Users,
  equipment: Laptop,
  laptop: Laptop,
  hours: Clock,
  balance: Clock,
};

function getBenefitIcon(text: string): React.ElementType {
  const lowerText = text.toLowerCase();
  for (const [keyword, icon] of Object.entries(benefitIcons)) {
    if (lowerText.includes(keyword)) {
      return icon;
    }
  }
  return Heart;
}

export function BenefitsGrid({ benefits }: BenefitsGridProps) {
  const { t } = useAppTranslation();

  if (!benefits) return null;

  // Parse benefits into items
  const lines = benefits.split('\n').filter(line => line.trim());
  const benefitItems: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const item = trimmed.replace(/^[-•*]\s*/, '');
      if (item) benefitItems.push(item);
    }
  });

  // If no structured items, show raw content
  if (benefitItems.length === 0) {
    return (
      <section id="benefits" className="scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {t("careers.job.benefits", "What We Offer")}
          </h2>
          <div 
            className="prose prose-lg max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: parseJobMarkdown(benefits) }}
          />
        </motion.div>
      </section>
    );
  }

  return (
    <section id="benefits" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("careers.job.benefits", "What We Offer")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("careers.job.benefitsDesc", "Perks and benefits of joining our team")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefitItems.map((benefit, index) => {
            const Icon = getBenefitIcon(benefit);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/20 hover:bg-primary/5 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium pt-2">
                  {benefit}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
