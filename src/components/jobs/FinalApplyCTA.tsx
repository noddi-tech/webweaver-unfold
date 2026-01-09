import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, MessageCircle } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";

interface FinalApplyCTAProps {
  jobTitle: string;
  applicationUrl?: string | null;
  applicationEmail?: string | null;
}

export function FinalApplyCTA({ jobTitle, applicationUrl, applicationEmail }: FinalApplyCTAProps) {
  const { t } = useAppTranslation();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-vibrant-purple/5 border border-primary/10 text-center"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
        {t("careers.job.interested", "Interested in this role?")}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
        {t("careers.job.applyDesc", "We'd love to hear from you. Apply now and join our team building the future of automotive services.")}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {applicationUrl && (
          <Button size="lg" className="group" asChild>
            <a href={applicationUrl} target="_blank" rel="noopener noreferrer">
              {t("careers.jobs.apply", "Apply Now")}
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </Button>
        )}
        {applicationEmail && !applicationUrl && (
          <Button size="lg" asChild>
            <a href={`mailto:${applicationEmail}?subject=Application for ${jobTitle}`}>
              <Mail className="w-4 h-4 mr-2" />
              {t("careers.jobs.apply", "Apply Now")}
            </a>
          </Button>
        )}
        <Button variant="outline" size="lg" asChild>
          <a href="mailto:careers@noddi.tech">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("careers.job.askQuestion", "Ask a Question")}
          </a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        {t("careers.job.contactNote", "Questions? Reach out to")} <a href="mailto:careers@noddi.tech" className="text-primary hover:underline">careers@noddi.tech</a>
      </p>
    </motion.section>
  );
}
