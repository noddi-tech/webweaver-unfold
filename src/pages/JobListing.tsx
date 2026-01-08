import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useJobListing } from "@/hooks/useJobListings";
import { useEditMode } from "@/contexts/EditModeContext";
import { ArrowLeft, Briefcase, MapPin, Clock, Calendar, DollarSign, ExternalLink, Mail, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobEditModal } from "@/components/JobEditModal";
import { parseJobMarkdown } from "@/lib/markdownUtils";

const mapEmploymentType = (type: string | null): string => {
  const mapping: Record<string, string> = {
    "Full-time": "FULL_TIME",
    "Part-time": "PART_TIME",
    "Contract": "CONTRACTOR",
    "Internship": "INTERN",
    "Temporary": "TEMPORARY",
  };
  return type ? mapping[type] || "FULL_TIME" : "FULL_TIME";
};

interface EditableSectionProps {
  children: React.ReactNode;
  onEdit: () => void;
  editMode: boolean;
  className?: string;
}

function EditableSection({ children, onEdit, editMode, className = "" }: EditableSectionProps) {
  if (!editMode) return <>{children}</>;
  
  return (
    <div className={`group relative ${className}`}>
      {children}
      <button
        onClick={onEdit}
        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:bg-primary/90"
        title="Edit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const JobListing = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useAppTranslation();
  const { data: job, isLoading, error } = useJobListing(slug || "");
  const { editMode } = useEditMode();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalField, setEditModalField] = useState<"description" | "requirements" | "benefits" | "title" | "basics">("description");

  const pageUrl = `https://noddi.tech/${i18n.language}/careers/${slug}`;
  const truncatedDescription = job?.description?.slice(0, 160) || t("careers.job.defaultDescription", "Join our team at Navio");

  // JSON-LD structured data for job posting
  const structuredData = job ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || "",
    datePosted: job.posted_at,
    validThrough: job.expires_at || undefined,
    employmentType: mapEmploymentType(job.employment_type),
    hiringOrganization: {
      "@type": "Organization",
      name: "Navio",
      sameAs: "https://noddi.tech",
      logo: "https://noddi.tech/favicon.ico"
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Oslo",
        addressCountry: "NO"
      }
    },
    ...(job.salary_range && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "NOK",
        value: {
          "@type": "QuantitativeValue",
          value: job.salary_range,
          unitText: "YEAR"
        }
      }
    }),
    directApply: !!job.application_url
  } : null;

  const openEditModal = (field: typeof editModalField) => {
    setEditModalField(field);
    setEditModalOpen(true);
  };

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
      <Helmet>
        <title>{job.title} – Navio Careers</title>
        <meta name="description" content={truncatedDescription} />
        <meta property="og:title" content={`${job.title} – Navio Careers`} />
        <meta property="og:description" content={truncatedDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={job.title} />
        <meta name="twitter:description" content={truncatedDescription} />
        <link rel="canonical" href={pageUrl} />
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

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
        <EditableSection editMode={editMode} onEdit={() => openEditModal("basics")}>
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
        </EditableSection>

        {/* Description */}
        {job.description && (
          <EditableSection editMode={editMode} onEdit={() => openEditModal("description")}>
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{t("careers.job.aboutRole", "About This Role")}</h2>
              <div 
                className="prose prose-lg max-w-none text-muted-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: parseJobMarkdown(job.description) }}
              />
            </section>
          </EditableSection>
        )}

        {/* Requirements */}
        {job.requirements && (
          <EditableSection editMode={editMode} onEdit={() => openEditModal("requirements")}>
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{t("careers.job.requirements", "Requirements")}</h2>
              <div 
                className="prose prose-lg max-w-none text-muted-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: parseJobMarkdown(job.requirements) }}
              />
            </section>
          </EditableSection>
        )}

        {/* Benefits */}
        {job.benefits && (
          <EditableSection editMode={editMode} onEdit={() => openEditModal("benefits")}>
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{t("careers.job.benefits", "What We Offer")}</h2>
              <div 
                className="prose prose-lg max-w-none text-muted-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: parseJobMarkdown(job.benefits) }}
              />
            </section>
          </EditableSection>
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

      {/* Edit Modal */}
      {job && (
        <JobEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          jobId={job.id}
          initialField={editModalField}
          jobData={{
            title: job.title,
            slug: job.slug,
            department: job.department,
            location: job.location,
            employment_type: job.employment_type,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            salary_range: job.salary_range,
            application_url: job.application_url,
            application_email: job.application_email,
          }}
        />
      )}
    </div>
  );
};

export default JobListing;
