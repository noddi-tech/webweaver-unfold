import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UspRow {
  id: string;
  title: string;
  icon_name: string;
  href: string | null;
  bg_token: string;
  text_token: string;
  active: boolean;
  sort_order: number | null;
}

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

type IconName = keyof typeof icons;

const GlobalUSPBar: React.FC = () => {
  const [usps, setUsps] = useState<UspRow[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("usps")
        .select("id,title,icon_name,href,bg_token,text_token,active,sort_order")
        .eq("active", true)
        .eq("location", "global")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!mounted) return;
      setUsps(data || []);
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!usps || usps.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {usps.map((u) => {
          const IconCmp = icons[(u.icon_name as IconName)] || icons["Sparkles"];
          const pill = (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border ${bgClass[u.bg_token] || "bg-secondary"} ${textClass[u.text_token] || "text-foreground"}`}>
              <IconCmp className="w-3.5 h-3.5" />
              <span className="text-xs font-medium whitespace-nowrap">{u.title}</span>
            </div>
          );
          return u.href ? (
            <Link key={u.id} to={u.href} className="shrink-0 hover:opacity-90 transition-opacity">
              {pill}
            </Link>
          ) : (
            <span key={u.id} className="shrink-0">{pill}</span>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalUSPBar;
