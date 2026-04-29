import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandLogo, type BrandLogoSettings } from "@/components/BrandLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoundProgressBar } from "@/components/RoundProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useInvestorSession } from "@/hooks/useInvestorSession";

const defaultBrand: BrandLogoSettings = {
  logo_text: "Navio",
  gradient_token: "gradient-primary",
  text_token: "foreground",
  logo_image_url: null,
  logo_variant: "text",
  logo_image_height: 32,
  logo_icon_name: null,
  logo_icon_position: "top-right",
  logo_icon_size: "default",
};

function normalizeBrand(data: any): BrandLogoSettings {
  return {
    logo_text: data.logo_text || "Navio",
    gradient_token: data.gradient_token || "gradient-primary",
    text_token: data.text_token || "foreground",
    logo_image_url: data.logo_image_url || null,
    logo_variant: data.logo_variant || "text",
    logo_image_height: typeof data.logo_image_height === "number" ? data.logo_image_height : 32,
    logo_icon_name: data.logo_icon_name || null,
    logo_icon_position: data.logo_icon_position || "top-right",
    logo_icon_size: data.logo_icon_size || "default",
  };
}

const formatM = (nok: bigint | number) => `${Math.round(Number(nok) / 1_000_000)}M`;

const formatCloseDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

function assembleRoundStatus(round?: {
  round_size_min_nok: number | null;
  round_size_max_nok: number | null;
  target_close_date: string | null;
} | null) {
  const parts = ["Fundraise"];

  if (round?.round_size_min_nok != null && round?.round_size_max_nok != null) {
    parts.push(`NOK ${formatM(round.round_size_min_nok)}–${formatM(round.round_size_max_nok)}`);
  }

  if (round?.target_close_date) {
    parts.push(`Closing ${formatCloseDate(round.target_close_date)}`);
  }

  return parts.join(" · ");
}

export function PortalHeader() {
  const navigate = useNavigate();
  const { name, signOut } = useInvestorSession();
  const [brand, setBrand] = useState<BrandLogoSettings>(defaultBrand);
  const firstName = name?.trim().split(/\s+/)[0] || "Investor";
  const initials = firstName.slice(0, 2).toUpperCase();

  const { data: round } = useQuery({
    queryKey: ["portal-round-terms-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_round_terms")
        .select("round_size_min_nok,round_size_max_nok,target_close_date")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    let mounted = true;

    const loadBrand = async () => {
      const { data } = await supabase
        .from("brand_settings")
        .select("logo_text,gradient_token,text_token,logo_image_url,logo_variant,logo_image_height,logo_icon_name,logo_icon_position,logo_icon_size")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (mounted && data) setBrand(normalizeBrand(data));
    };

    const onLocalUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      setBrand(normalizeBrand(detail));
    };

    loadBrand();
    window.addEventListener("brand_settings_updated", onLocalUpdate);

    const channel = supabase
      .channel("portal_brand_settings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "brand_settings" }, (payload) => {
        const next = (payload as any).new || {};
        setBrand(normalizeBrand(next));
      })
      .subscribe();

    return () => {
      mounted = false;
      window.removeEventListener("brand_settings_updated", onLocalUpdate);
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate("/investor");
  };

  const userMenu = (compact = false) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Open investor menu">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Button variant="ghost" className="gap-2 rounded-full px-3 text-foreground">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span>Hi, {firstName}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="glass-header sticky top-0 z-50 border-b border-border">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/portal" className="text-2xl font-bold transition-opacity hover:opacity-80">
            <BrandLogo brand={brand} />
          </Link>
          <div className="hidden md:flex">{userMenu(false)}</div>
          <div className="md:hidden">{userMenu(true)}</div>
        </div>
        <div className="flex flex-col items-center gap-3 border-t border-border/50 py-2 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-sm text-muted-foreground">{assembleRoundStatus(round)}</p>
          <RoundProgressBar />
        </div>
      </div>
    </header>
  );
}
