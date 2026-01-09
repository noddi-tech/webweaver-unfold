import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { useJobListings } from "@/hooks/useJobListings";
import { useEditMode } from "@/contexts/EditModeContext";
import { Briefcase, Rocket, Users, MapPin, Clock, ExternalLink, TrendingUp, Zap, Building, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { EditableCard } from "@/components/EditableCard";
import { EditableBenefitCard } from "@/components/EditableBenefitCard";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import type { LucideIcon } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  image_object_position: string;
}

const ensureMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const Careers = () => {
  const { t, i18n } = useAppTranslation();
  const { editMode } = useEditMode();
  const queryClient = useQueryClient();
  const { data: jobs, isLoading: jobsLoading } = useJobListings(editMode);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const benefits: { key: string; icon: LucideIcon; titleKey: string; descKey: string; titleFallback: string; descFallback: string }[] = [
    { key: "ownership", icon: TrendingUp, titleKey: "careers.benefits.ownership.title", descKey: "careers.benefits.ownership.description", titleFallback: "Ownership Mindset", descFallback: "Participate in Navio's success — all employees receive equity through our stock option program." },
    { key: "team", icon: Users, titleKey: "careers.benefits.team.title", descKey: "careers.benefits.team.description", titleFallback: "High-Performing Team", descFallback: "Work alongside talented, mission-driven professionals who value collaboration and impact." },
    { key: "growth", icon: Rocket, titleKey: "careers.benefits.growth.title", descKey: "careers.benefits.growth.description", titleFallback: "Growth & Development", descFallback: "Continuous learning, clear career pathways, and support for your professional evolution." },
    { key: "innovation", icon: Zap, titleKey: "careers.benefits.innovation.title", descKey: "careers.benefits.innovation.description", titleFallback: "Agile Innovation Culture", descFallback: "We move fast, iterate boldly, and learn from outcomes — grow through real responsibility." },
    { key: "collaboration", icon: Building, titleKey: "careers.benefits.collaboration.title", descKey: "careers.benefits.collaboration.description", titleFallback: "Purposeful Collaboration", descFallback: "We champion in-person connection and teamwork to solve complex challenges together." },
    { key: "flexibility", icon: Target, titleKey: "careers.benefits.flexibility.title", descKey: "careers.benefits.flexibility.description", titleFallback: "Outcome-Driven Flexibility", descFallback: "We focus on results over rigid routines and support flexible work arrangements where it enhances performance." },
  ];

  useEffect(() => {
    const loadEmployees = async () => {
      setEmployeesLoading(true);
      const { data } = await supabase
        .from("employees")
        .select("id, name, title, image_url, image_object_position")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setEmployees(data || []);
      setEmployeesLoading(false);
    };
    loadEmployees();
  }, []);

  const handleActiveToggle = async (jobId: string, active: boolean) => {
    const { error } = await supabase
      .from('job_listings')
      .update({ active })
      .eq('id', jobId);
    
    if (error) {
      toast.error('Failed to update job status');
    } else {
      queryClient.invalidateQueries({ queryKey: ['job-listings'] });
      toast.success(active ? 'Job published' : 'Job unpublished');
    }
  };

  const handleFeaturedToggle = async (jobId: string, featured: boolean) => {
    const { error } = await supabase
      .from('job_listings')
      .update({ featured })
      .eq('id', jobId);
    
    if (error) {
      toast.error('Failed to update featured status');
    } else {
      queryClient.invalidateQueries({ queryKey: ['job-listings'] });
      toast.success(featured ? 'Job featured' : 'Job unfeatured');
    }
  };

  useEffect(() => {
    document.title = t("careers.meta.title", "Careers – Navio");
    ensureMeta("description", t("careers.meta.description", "Join our team and help build the future of automotive services."));
  }, [t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="Navio Job Openings" 
          href="/careers/feed.xml" 
        />
      </Helmet>
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="careers.hero.title" fallbackText="Join Our Team" disableStyling>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {t("careers.hero.title", "Join Our Team")}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="careers.hero.subtitle" fallbackText="Help us transform the automotive industry">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("careers.hero.subtitle", "Help us transform the automotive industry")}
            </p>
          </EditableTranslation>
        </section>

        {/* Why Join Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="careers.why.title" fallbackText="Why Join Navio?">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t("careers.why.title", "Why Join Navio?")}
            </h2>
          </EditableTranslation>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <EditableBenefitCard
                key={benefit.key}
                elementIdPrefix={`careers-benefit-${benefit.key}`}
                icon={benefit.icon}
                titleKey={benefit.titleKey}
                titleFallback={benefit.titleFallback}
                descKey={benefit.descKey}
                descFallback={benefit.descFallback}
              />
            ))}
          </div>
        </section>

        {/* Team Section */}
        {(employees.length > 0 || employeesLoading) && (
          <section className="max-w-4xl mx-auto mb-20">
            <EditableTranslation translationKey="careers.team.title" fallbackText="Meet the Team">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {t("careers.team.title", "Meet the Team")}
              </h2>
            </EditableTranslation>
            {employeesLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/5] w-full" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    pagePrefix="careers"
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Open Positions Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <EditableTranslation translationKey="careers.positions.title" fallbackText="Open Positions">
            <h2 className="text-3xl font-bold mb-8">
              {t("careers.positions.title", "Open Positions")}
            </h2>
          </EditableTranslation>
          
          {jobsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-3" />
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <EditableCard
                  key={job.id}
                  elementIdPrefix={`careers-job-${job.slug}`}
                  defaultBackground="bg-card"
                  defaultTextColor="foreground"
                  className={`p-6 hover:shadow-lg transition-shadow ${!job.active ? 'opacity-60' : ''}`}
                >
                  {editMode && (
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Active</span>
                        <Switch 
                          checked={job.active} 
                          onCheckedChange={(checked) => handleActiveToggle(job.id, checked)} 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Featured</span>
                        <Switch 
                          checked={job.featured} 
                          onCheckedChange={(checked) => handleFeaturedToggle(job.id, checked)} 
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link to={`/${i18n.language}/careers/${job.slug}`}>
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                        </Link>
                        {job.featured && (
                          <Badge className="bg-primary text-primary-foreground">
                            {t("careers.jobs.featured", "Featured")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.department && (
                          <Badge variant="secondary">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.department}
                          </Badge>
                        )}
                        {job.location && (
                          <Badge variant="outline">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </Badge>
                        )}
                        {job.employment_type && (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.employment_type}
                          </Badge>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {job.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <Link to={`/${i18n.language}/careers/${job.slug}`}>
                        {t("careers.jobs.viewDetails", "View Details")}
                      </Link>
                    </Button>
                    {job.application_url && (
                      <Button asChild>
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                          {t("careers.jobs.apply", "Apply Now")}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                    {job.application_email && !job.application_url && (
                      <Button asChild>
                        <a href={`mailto:${job.application_email}`}>
                          {t("careers.jobs.apply", "Apply Now")}
                        </a>
                      </Button>
                    )}
                  </div>
                </EditableCard>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-card text-card-foreground rounded-xl border border-border text-center">
              <EditableTranslation translationKey="careers.positions.empty" fallbackText="No open positions at the moment." disableStyling>
                <p className="text-card-foreground/70">
                  {t("careers.positions.empty", "No open positions at the moment. Check back soon or send us your CV for future opportunities.")}
                </p>
              </EditableTranslation>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="max-w-4xl mx-auto text-center">
          <EditableTranslation translationKey="careers.contact.title" fallbackText="Get in Touch">
            <h2 className="text-3xl font-bold mb-6">
              {t("careers.contact.title", "Get in Touch")}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="careers.contact.description" fallbackText="Interested in joining us?">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("careers.contact.description", "Interested in joining us? Send your CV and a brief introduction to our careers team.")}
            </p>
          </EditableTranslation>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
