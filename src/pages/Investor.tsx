import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo, BrandLogoSettings } from "@/components/BrandLogo";
import { InvestorGateForm } from "@/components/InvestorGateForm";
import { supabase } from "@/integrations/supabase/client";
import { useInvestorSession } from "@/hooks/useInvestorSession";

const defaultBrand: BrandLogoSettings = {
  logo_text: "",
  gradient_token: "gradient-primary",
  text_token: "foreground",
  logo_image_url: null,
  logo_variant: "text",
  logo_image_height: 32,
  logo_icon_name: null,
  logo_icon_position: "top-right",
  logo_icon_size: "default",
};

export default function Investor() {
  const navigate = useNavigate();
  const { sessionId, hasAcceptedNda, isLoaded } = useInvestorSession();
  const [brand, setBrand] = useState<BrandLogoSettings>(defaultBrand);

  useEffect(() => {
    document.title = "Investor Portal — Navio Solutions";
  }, []);

  useEffect(() => {
    if (!isLoaded || !sessionId) return;
    navigate(hasAcceptedNda ? "/portal" : "/investor/nda", { replace: true });
  }, [hasAcceptedNda, isLoaded, navigate, sessionId]);

  useEffect(() => {
    let mounted = true;

    const normalizeBrand = (data: any): BrandLogoSettings => ({
      logo_text: data.logo_text || "",
      gradient_token: data.gradient_token || "gradient-primary",
      text_token: data.text_token || "foreground",
      logo_image_url: data.logo_image_url || null,
      logo_variant: data.logo_variant || "text",
      logo_image_height: typeof data.logo_image_height === "number" ? data.logo_image_height : 32,
      logo_icon_name: data.logo_icon_name || null,
      logo_icon_position: data.logo_icon_position || "top-right",
      logo_icon_size: data.logo_icon_size || "default",
    });

    const loadBrand = async () => {
      const { data } = await supabase
        .from("brand_settings")
        .select("logo_text,gradient_token,text_token,logo_image_url,logo_variant,logo_image_height,logo_icon_name,logo_icon_position,logo_icon_size")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (mounted && data) {
        setBrand(normalizeBrand(data));
      }
    };

    const onLocalUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      setBrand(normalizeBrand(detail));
    };

    loadBrand();
    window.addEventListener("brand_settings_updated", onLocalUpdate);

    const channel = supabase
      .channel("investor_brand_settings_changes")
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-background flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] top-16 z-0 h-72 w-72 opacity-40 blur-3xl"
        style={{ background: "var(--gradient-mesh-velvet)" }}
      />

      <header className="sticky top-0 z-10 h-16 shrink-0 bg-background/95 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-0">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          {brand.logo_text || brand.logo_image_url ? (
            <Link to="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
              <BrandLogo brand={brand} />
            </Link>
          ) : null}
          <p className="hidden sm:block text-sm text-muted-foreground">
            Series A · Closing 30 June 2026
          </p>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center py-10">
        <div className="mx-auto w-full max-w-[480px] px-6">
          <InvestorGateForm />
        </div>
      </section>

      <footer className="relative z-10 flex h-16 shrink-0 items-center justify-center px-6">
        <p className="text-xs text-muted-foreground text-center">
          Confidential investor portal · Access governed by NDA
        </p>
      </footer>
    </main>
  );
}
