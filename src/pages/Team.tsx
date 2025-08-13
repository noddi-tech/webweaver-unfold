import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import { useHeadings } from "@/hooks/useHeadings";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TYPOGRAPHY_SCALE } from "@/lib/typography";

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  image_url: string | null;
  image_object_position?: string | null;
  sort_order: number | null;
  active: boolean;
  section: string;
}

interface EmployeeSettings {
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  name_token: string;
  title_token: string;
  link_token: string;
}

interface DbImage {
  id: string;
  title: string;
  alt: string | null;
  caption: string | null;
  section: string;
  file_name: string;
  file_url: string;
  link_url: string | null;
  sort_order: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
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

const setCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", `${window.location.origin}${href}`);
};

const bgClass: Record<string, string> = {
  background: "bg-background",
  card: "bg-card",
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  "gradient-primary": "bg-gradient-primary",
  "gradient-background": "bg-gradient-background",
  "gradient-hero": "bg-gradient-hero",
};
const textClass: Record<string, string> = {
  foreground: "text-foreground",
  "muted-foreground": "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
};
const borderClass: Record<string, string> = {
  border: "border-border",
};

const posClass = (p?: string | null) => {
  switch (p) {
    case "top": return "object-top";
    case "bottom": return "object-bottom";
    case "left": return "object-left";
    case "right": return "object-right";
    case "left-top": return "object-left-top";
    case "left-bottom": return "object-left-bottom";
    case "right-top": return "object-right-top";
    case "right-bottom": return "object-right-bottom";
    default: return "object-center";
  }
};

const Team = () => {
  const { headings, getHeading } = useHeadings('team', 'hero');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<EmployeeSettings | null>(null);
  const [sections, setSections] = useState<Array<{ id: string; name: string; sort_order: number | null }>>([]);
  const [experienceLogos, setExperienceLogos] = useState<DbImage[]>([]);

  useEffect(() => {
    document.title = "Our Team – Noddi Tech";
    ensureMeta("description", "Meet the Noddi Tech team: names, roles, and contact details.");
    setCanonical("/team");
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("employees")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      setEmployees(data || []);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMeta = async () => {
      const [{ data: setts }, { data: secs }] = await Promise.all([
        (supabase as any)
          .from("employees_settings")
          .select("section_title,section_subtitle,background_token,card_bg_token,border_token,name_token,title_token,link_token")
          .order("created_at", { ascending: true })
          .limit(1),
        (supabase as any)
          .from("employees_sections")
          .select("id,name,sort_order")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
      ]);
      setSettings((setts && setts[0]) || null);
      setSections(secs || []);
  };
  loadMeta();
  }, []);

  useEffect(() => {
    const fetchExperienceLogos = async () => {
      const { data, error } = await (supabase as any)
        .from("images")
        .select("id,title,alt,caption,section,file_name,file_url,link_url,sort_order,active,created_at,updated_at")
        .eq("active", true)
        .eq("section", "experience")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!error) setExperienceLogos(data || []);
    };
    fetchExperienceLogos();
  }, []);

  const orderedSectionNames = useMemo(() => {
    const names = new Set<string>(sections.map((s) => s.name));
    // Include any ad-hoc sections used by employees
    employees.forEach((e) => names.add(e.section || "General"));
    return sections.length > 0 ? sections.map((s) => s.name).concat(Array.from(names).filter((n) => !sections.find((s) => s.name === n))) : Array.from(names);
  }, [sections, employees]);

  const employeesBySection = useMemo(() => {
    const map: Record<string, Employee[]> = {};
    employees.forEach((e) => {
      const k = e.section || "General";
      (map[k] = map[k] || []).push(e);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    return map;
  }, [employees]);

  const cardBg = bgClass[settings?.card_bg_token || "card"];
  const borderCls = borderClass[settings?.border_token || "border"];
  const nameCls = textClass[settings?.name_token || "foreground"];
  const titleCls = textClass[settings?.title_token || "muted-foreground"];
  const linkCls = textClass[settings?.link_token || "primary"];

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <header className="text-center max-w-3xl mx-auto mb-12">
          {(() => {
            const h1Heading = headings.find(h => h.element_type === 'h1');
            const h1Option = TYPOGRAPHY_SCALE.headings.find(h => h.tag === 'h1');
            const colorClass = h1Heading?.color_token === 'gradient-text' 
              ? 'gradient-text' 
              : `text-${h1Heading?.color_token || 'foreground'}`;
            return h1Heading ? (
              <h1 className={`${h1Option?.class || 'text-6xl font-bold'} ${colorClass}`}>
                {h1Heading.content}
              </h1>
            ) : (
              <h1 className={`${h1Option?.class || 'text-6xl font-bold'} gradient-text`}>
                {settings?.section_title || "Meet the Team"}
              </h1>
            );
          })()}
          
          {(() => {
            // Check for h3, h4, or subtitle headings
            const h3Heading = headings.find(h => h.element_type === 'h3');
            const h4Heading = headings.find(h => h.element_type === 'h4');
            const subtitleHeading = headings.find(h => h.element_type === 'subtitle');
            
            if (h4Heading) {
              const h4Option = TYPOGRAPHY_SCALE.headings.find(h => h.tag === 'h4');
              const colorClass = h4Heading.color_token === 'gradient-text' 
                ? 'gradient-text' 
                : `text-${h4Heading.color_token || 'foreground'}`;
              return (
                <h4 className={`${h4Option?.class || 'text-xl font-semibold'} ${colorClass} mt-3`}>
                  {h4Heading.content}
                </h4>
              );
            } else if (h3Heading) {
              const h3Option = TYPOGRAPHY_SCALE.headings.find(h => h.tag === 'h3');
              const colorClass = h3Heading.color_token === 'gradient-text' 
                ? 'gradient-text' 
                : `text-${h3Heading.color_token || 'foreground'}`;
              return (
                <h3 className={`${h3Option?.class || 'text-2xl font-semibold'} ${colorClass} mt-3`}>
                  {h3Heading.content}
                </h3>
              );
            } else if (subtitleHeading) {
              const subtitleOption = TYPOGRAPHY_SCALE.bodyText.find(b => b.name === 'Large Body');
              const colorClass = subtitleHeading.color_token === 'gradient-text' 
                ? 'gradient-text' 
                : `text-${subtitleHeading.color_token || 'muted-foreground'}`;
              return (
                <p className={`${subtitleOption?.class || 'text-xl'} ${colorClass} mt-3`}>
                  {subtitleHeading.content}
                </p>
              );
            } else if (settings?.section_subtitle) {
              return (
                <p className="text-muted-foreground mt-3">
                  {settings.section_subtitle}
                </p>
              );
            }
            return null;
          })()}
          {experienceLogos.length > 0 && (
            <Card className="mt-6 bg-card border-border">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-4 place-items-center" aria-label="Experience logos">
                {experienceLogos.map((img) => {
                  const Img = (
                      <div className="flex h-16 md:h-16 w-full items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <img
                          key={img.id}
                          src={img.file_url}
                          alt={img.alt ?? img.title}
                          className="h-10 md:h-12 w-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                  );
                  return img.link_url ? (
                    <a key={img.id} href={img.link_url} target="_blank" rel="noopener noreferrer" aria-label={`${img.title} website`}>
                      {Img}
                    </a>
                  ) : (
                    <div key={img.id}>{Img}</div>
                  );
                })}
              </div>
            </Card>
          )}
        </header>

        {orderedSectionNames.map((sec) => (
          <section key={sec} aria-label={`Team section ${sec}`} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">{sec}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(employeesBySection[sec] || []).map((m) => (
                <article key={m.id} className={`rounded-xl border ${borderCls} ${cardBg} overflow-hidden`}>
{m.image_url && (
  <img
    src={m.image_url}
    alt={`${m.name} – ${m.title}`}
    className={`w-full h-80 md:h-[24rem] object-cover ${posClass(m.image_object_position)}`}
    loading="lazy"
  />
)}
                  <div className="p-5 space-y-2">
                    <h3 className={`text-xl font-semibold ${nameCls}`}>{m.name}</h3>
                    <p className={`text-sm ${titleCls}`}>{m.title}</p>
                    <div className="flex flex-wrap gap-5 pt-4">
                      {m.email && (
                        <a href={`mailto:${m.email}`} className={`inline-flex items-center gap-2 ${linkCls} hover:underline`} aria-label={`Email ${m.name}`}>
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Email</span>
                        </a>
                      )}
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className={`inline-flex items-center gap-2 ${linkCls} hover:underline`} aria-label={`Call ${m.name}`}>
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">Call</span>
                        </a>
                      )}
                      {m.linkedin_url && (
                        <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${linkCls} hover:underline`} aria-label={`${m.name} on LinkedIn`}>
                          <Linkedin className="h-4 w-4" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              {(employeesBySection[sec] || []).length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">No members in this section yet.</Card>
              )}
            </div>
          </section>
        ))}

        {employees.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">Team will appear here soon.</Card>
        )}
      </main>
    </div>
  );
};

export default Team;
