import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { supabase } from "@/integrations/supabase/client";
import { AboutNavigation } from "@/components/about/AboutNavigation";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutMission } from "@/components/about/AboutMission";
import { AboutMetrics } from "@/components/about/AboutMetrics";
import { AboutPartners } from "@/components/about/AboutPartners";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutVision } from "@/components/about/AboutVision";
import { AboutCTA } from "@/components/about/AboutCTA";

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

const AboutUs = () => {
  const { t } = useAppTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    document.title = t("about.meta.title", "About Us – Navio");
    ensureMeta("description", t("about.meta.description", "Learn about Navio, our mission, and the team building the future of automotive services."));
  }, [t]);

  useEffect(() => {
    const loadEmployees = async () => {
      const { data } = await supabase
        .from("employees")
        .select("id, name, title, image_url, image_object_position")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setEmployees(data || []);
    };
    loadEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section */}
      <AboutHero />
      
      {/* Sticky Navigation */}
      <AboutNavigation />
      
      <main>
        {/* Our Story */}
        <div id="story">
          <AboutStory />
        </div>
        
        {/* Mission */}
        <div id="mission">
          <AboutMission />
        </div>
        
        {/* By the Numbers */}
        <div id="metrics">
          <AboutMetrics />
        </div>
        
        {/* Partners */}
        <div id="partners">
          <AboutPartners />
        </div>
        
        {/* Values */}
        <div id="values">
          <AboutValues />
        </div>
        
        {/* Vision */}
        <AboutVision />
        
        {/* Team Section */}
        {employees.length > 0 && (
          <section id="team" className="py-20 md:py-28 bg-muted/30" data-header-color="dark">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <EditableTranslation translationKey="about.team.title" fallbackText="Our Team">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Our Team
                  </h2>
                </EditableTranslation>
                <EditableTranslation translationKey="about.team.subtitle" fallbackText="The people behind Navio">
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    The people behind Navio
                  </p>
                </EditableTranslation>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    pagePrefix="about"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Final CTA */}
        <AboutCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
