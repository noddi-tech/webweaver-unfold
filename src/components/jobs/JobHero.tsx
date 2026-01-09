import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, MapPin, Clock, Calendar, DollarSign, ExternalLink, Mail, Star, Bookmark } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { motion } from "framer-motion";

interface JobHeroProps {
  job: {
    title: string;
    department: string | null;
    location: string | null;
    employment_type: string | null;
    salary_range: string | null;
    posted_at: string | null;
    featured: boolean | null;
    application_url: string | null;
    application_email: string | null;
  };
  onApply: () => void;
}

export function JobHero({ job, onApply }: JobHeroProps) {
  const { t, i18n } = useAppTranslation();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-vibrant-purple to-primary opacity-5" />
      
      <div className="relative">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            to={`/${i18n.language}/careers`} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t("careers.job.backToCareers", "Back to Careers")}
          </Link>
        </motion.div>

        {/* Header content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {job.department && (
              <Badge variant="secondary" className="text-sm font-medium">
                <Briefcase className="w-3 h-3 mr-1.5" />
                {job.department}
              </Badge>
            )}
            {job.featured && (
              <Badge className="bg-gradient-to-r from-brand-orange to-brand-pink text-white border-0">
                <Star className="w-3 h-3 mr-1.5 fill-current" />
                {t("careers.jobs.featured", "Featured")}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {job.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-8">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            {job.employment_type && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {job.employment_type}
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                {job.salary_range}
              </span>
            )}
            {job.posted_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {t("careers.job.posted", "Posted:")} {formatDate(job.posted_at)}
              </span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="group" onClick={onApply}>
              {t("careers.jobs.apply", "Apply Now")}
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="group">
              <Bookmark className="w-4 h-4 mr-2" />
              {t("careers.job.saveJob", "Save Job")}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
