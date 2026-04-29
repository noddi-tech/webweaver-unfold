import { useQuery } from "@tanstack/react-query";
import { PersonCard } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { SlideVisualProps, TeamConfig } from "../types";

interface TeamMemberRow {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  is_founder: boolean | null;
  display_order: number;
}

export function TeamVisual({ slide }: SlideVisualProps<TeamConfig>) {
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

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {members.length ? (
        <div className="deck-auto-grid gap-4">
          {members.map((member) => <PersonCard key={member.id} person={{ name: member.name, role: member.role, bio: member.bio ?? "", imageUrl: member.photo_url }} density={member.is_founder ? "sparse" : "dense"} />)}
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
