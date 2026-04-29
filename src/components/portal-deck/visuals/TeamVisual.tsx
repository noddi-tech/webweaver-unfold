import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { SlideVisualProps, VisualConfig } from "../types";

interface TeamMemberRow {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  is_founder: boolean | null;
  display_order: number;
}

function MemberCard({ member, large = false }: { member: TeamMemberRow; large?: boolean }) {
  return (
    <article className="rounded-xl bg-card-surface p-5 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-background">
        {member.photo_url ? <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" loading="lazy" /> : <span className="text-xl font-bold text-primary">{member.name.slice(0, 1)}</span>}
      </div>
      <h3 className={large ? "text-xl font-semibold text-foreground" : "text-lg font-semibold text-foreground"}>{member.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
      {member.bio ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground">{member.bio}</p> : null}
    </article>
  );
}

export function TeamVisual({ slide }: SlideVisualProps<VisualConfig>) {
  const { data: members = [] } = useQuery({
    queryKey: ["portal-team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_team_members")
        .select("id,name,role,bio,photo_url,is_founder,display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as TeamMemberRow[];
    },
  });

  const founders = members.filter((member) => member.is_founder);
  const others = members.filter((member) => !member.is_founder);

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {members.length ? (
        <div className="space-y-5">
          {founders.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{founders.map((member) => <MemberCard key={member.id} member={member} large />)}</div> : null}
          {others.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map((member) => <MemberCard key={member.id} member={member} />)}</div> : null}
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
