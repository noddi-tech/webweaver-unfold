import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useJobListing } from "@/hooks/useJobListings";
import { ArrowLeft, Briefcase, MapPin, Clock, Calendar, DollarSign, ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const JobListing = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useAppTranslation();
  const { data: job, isLoading, error } = useJobListing(slug || "");

  useEffect(() => {
    if (job) {
      document.title = `${job.title} – Navio Careers`;
    }
  }, [job]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
          <Skeleton className="h-6 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-48 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">{t("careers.job.notFound", "Job Not Found")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("careers.job.notFoundDesc", "The job listing you're looking for doesn't exist or has been removed.")}
          </p>
          <Button asChild>
            <Link to={`/${i18n.language}/careers`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("careers.job.backToCareers", "Back to Careers")}
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
        {/* Back link */}
        <Link 
          to={`/${i18n.language}/careers`} 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("careers.job.backToCareers", "Back to Careers")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold">{job.title}</h1>
            {job.featured && (
              <Badge className="bg-primary text-primary-foreground">
                {t("careers.jobs.featured", "Featured")}
              </Badge>
            )}
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.department && (
              <Badge variant="secondary" className="text-sm">
                <Briefcase className="w-3 h-3 mr-1" />
                {job.department}
              </Badge>
            )}
            {job.location && (
              <Badge variant="outline" className="text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {job.location}
              </Badge>
            )}
            {job.employment_type && (
              <Badge variant="outline" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {job.employment_type}
              </Badge>
            )}
          </div>

          {/* Posted date & salary */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.posted_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t("careers.job.posted", "Posted:")} {formatDate(job.posted_at)}
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary_range}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{t("careers.job.aboutRole", "About This Role")}</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </section>
        )}

        {/* Requirements */}
        {job.requirements && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{t("careers.job.requirements", "Requirements")}</h2>
            <div 
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </section>
        )}

        {/* Benefits */}
        {job.benefits && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{t("careers.job.benefits", "What We Offer")}</h2>
            <div 
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.benefits }}
            />
          </section>
        )}

        {/* Apply CTA */}
        <section className="mt-12 p-8 bg-muted rounded-xl text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {t("careers.job.interested", "Interested in this role?")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("careers.job.applyDesc", "We'd love to hear from you. Apply now and join our team.")}
          </p>
          <div className="flex justify-center gap-4">
            {job.application_url && (
              <Button size="lg" asChild>
                <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                  {t("careers.jobs.apply", "Apply Now")}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
            {job.application_email && !job.application_url && (
              <Button size="lg" asChild>
                <a href={`mailto:${job.application_email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  {t("careers.jobs.apply", "Apply Now")}
                </a>
              </Button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JobListing;
