import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  image_url: string | null;
  sort_order: number | null;
  active: boolean;
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

const Team = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <header className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">Meet the Team</h1>
          <p className="text-muted-foreground mt-3">The people behind Noddi Tech.</p>
        </header>

        <section aria-label="Team members" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((m) => (
            <article key={m.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {m.image_url && (
                <img
                  src={m.image_url}
                  alt={`${m.name} – ${m.title}`}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5 space-y-2">
                <h2 className="text-xl font-semibold">{m.name}</h2>
                <p className="text-sm text-muted-foreground">{m.title}</p>
                <div className="flex flex-wrap gap-5 pt-4">
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 text-primary hover:underline" aria-label={`Email ${m.name}`}>
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="inline-flex items-center gap-2 text-primary hover:underline" aria-label={`Call ${m.name}`}>
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Call</span>
                    </a>
                  )}
                  {m.linkedin_url && (
                    <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline" aria-label={`${m.name} on LinkedIn`}>
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
          {employees.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground">Team will appear here soon.</Card>
          )}
        </section>
      </main>
    </div>
  );
};

export default Team;
