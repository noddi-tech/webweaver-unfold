import { motion } from "framer-motion";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface WorkAssignment {
  icon: string;
  title: string;
  description: string;
}

interface WorkAssignmentsProps {
  assignments: WorkAssignment[];
}

export function WorkAssignments({ assignments }: WorkAssignmentsProps) {
  const { t } = useAppTranslation();

  if (!assignments || assignments.length === 0) return null;

  const getIcon = (iconName: string): LucideIcon => {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || LucideIcons.Briefcase;
  };

  return (
    <section id="work-assignments" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("careers.job.workAssignments", "What You'll Work On")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("careers.job.workAssignmentsDesc", "Key areas where you'll make an impact")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment, index) => {
            const Icon = getIcon(assignment.icon);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-card/5 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {assignment.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {assignment.description}
                </p>

                {/* Decorative gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
