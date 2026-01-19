import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useJobListing } from "@/hooks/useJobListings";
import { useEditMode } from "@/contexts/EditModeContext";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobEditModal } from "@/components/JobEditModal";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

// New components
import { JobHero } from "@/components/jobs/JobHero";
import { CompanyIntro } from "@/components/jobs/CompanyIntro";
import { JobNavigation } from "@/components/jobs/JobNavigation";
import { AboutRole } from "@/components/jobs/AboutRole";
import { WorkAssignments } from "@/components/jobs/WorkAssignments";
import { TechStackSection } from "@/components/jobs/TechStackSection";
import { RequirementsList } from "@/components/jobs/RequirementsList";
import { BenefitsGrid } from "@/components/jobs/BenefitsGrid";
import { StickyApplyCTA } from "@/components/jobs/StickyApplyCTA";
import { FinalApplyCTA } from "@/components/jobs/FinalApplyCTA";

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
  const [isHovered, setIsHovered] = useState(false);
  
  if (!editMode) return <>{children}</>;
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <button
          onClick={onEdit}
          className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-50"
          title="Edit this section"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
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

  // Parse tech stack and work assignments from JSON (new columns from migration)
  const jobData = job as typeof job & { tech_stack?: unknown; work_assignments?: unknown; company_intro?: string | null };
  const techStack = jobData?.tech_stack ? (Array.isArray(jobData.tech_stack) ? jobData.tech_stack : []) : [];
  const workAssignments = jobData?.work_assignments ? (Array.isArray(jobData.work_assignments) ? jobData.work_assignments : []) : [];

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

  const handleApply = () => {
    if (job?.application_url) {
      window.open(job.application_url, "_blank", "noopener,noreferrer");
    } else if (job?.application_email) {
      window.location.href = `mailto:${job.application_email}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
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
        <main className="container mx-auto px-6 pt-32 pb-20 max-w-5xl text-center">
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

  // Breadcrumb items for JSON-LD
  const breadcrumbItems = useMemo(() => [
    { name: 'Home', url: '/' },
    { name: 'Careers', url: `/${i18n.language}/careers` },
    { name: job.title }
  ], [job.title, i18n.language]);

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

      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        {/* Hero Section */}
        <EditableSection editMode={editMode} onEdit={() => openEditModal("basics")}>
          <JobHero job={job} onApply={handleApply} />
        </EditableSection>

        {/* Company Introduction */}
        <div className="mt-10">
          <CompanyIntro customIntro={jobData.company_intro} />
        </div>

        {/* Navigation */}
        <div className="mt-10 mb-12">
          <JobNavigation
            hasDescription={!!job.description}
            hasWorkAssignments={workAssignments.length > 0}
            hasTechStack={techStack.length > 0}
            hasRequirements={!!job.requirements}
            hasBenefits={!!job.benefits}
          />
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* About the Role */}
          {job.description && (
            <EditableSection editMode={editMode} onEdit={() => openEditModal("description")}>
              <AboutRole description={job.description} />
            </EditableSection>
          )}

          {/* Work Assignments */}
          {workAssignments.length > 0 && (
            <WorkAssignments assignments={workAssignments as Array<{icon: string; title: string; description: string}>} />
          )}

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <TechStackSection techStack={techStack as Array<{name: string; logo_url?: string; category: string; description?: string}>} />
          )}

          {/* Requirements */}
          {job.requirements && (
            <EditableSection editMode={editMode} onEdit={() => openEditModal("requirements")}>
              <RequirementsList requirements={job.requirements} />
            </EditableSection>
          )}

          {/* Benefits */}
          {job.benefits && (
            <EditableSection editMode={editMode} onEdit={() => openEditModal("benefits")}>
              <BenefitsGrid benefits={job.benefits} />
            </EditableSection>
          )}
        </div>

        {/* Final CTA */}
        <FinalApplyCTA 
          jobTitle={job.title}
          applicationUrl={job.application_url}
          applicationEmail={job.application_email}
        />
      </main>

      <Footer />

      {/* Sticky Apply CTA */}
      <StickyApplyCTA
        jobTitle={job.title}
        jobId={job.id}
        applicationUrl={job.application_url}
        applicationEmail={job.application_email}
      />

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
            company_intro: jobData.company_intro,
            work_assignments: workAssignments as Array<{icon: string; title: string; description: string}>,
            tech_stack: techStack.map((t: { id?: string; name: string }) => t.id || t.name),
          }}
        />
      )}
    </div>
  );
};

export default JobListing;
