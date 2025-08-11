import { Button } from "@/components/ui/button";
import { Menu, X, icons } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GlobalUSPBar from "@/components/GlobalUSPBar";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [brand, setBrand] = useState({ logo_text: "", gradient_token: "gradient-primary", text_token: "foreground", logo_image_url: null as string | null, logo_variant: "text", logo_image_height: 32, logo_icon_name: null as string | null, logo_icon_position: "top-right", logo_icon_size: "default" });
  const location = useLocation();
  const isHome = location.pathname === "/";
  const HeadingTag = (isHome ? "h1" : "h2") as keyof JSX.IntrinsicElements;
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });
    supabase.auth.getSession().then(({ data }) => setAuthenticated(!!data.session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("brand_settings")
        .select("logo_text,gradient_token,text_token,logo_image_url,logo_variant,logo_image_height,logo_icon_name,logo_icon_position,logo_icon_size")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      if (data) {
        setBrand({
          logo_text: data.logo_text || "",
          gradient_token: data.gradient_token || "gradient-primary",
          text_token: data.text_token || "foreground",
          logo_image_url: data.logo_image_url || null,
          logo_variant: data.logo_variant || "text",
          logo_image_height: typeof (data as any).logo_image_height === 'number' ? (data as any).logo_image_height : 32,
          logo_icon_name: (data as any).logo_icon_name || null,
          logo_icon_position: (data as any).logo_icon_position || "top-right",
          logo_icon_size: (data as any).logo_icon_size || "default",
        });
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Listen for brand settings updates via Supabase realtime and local events
  useEffect(() => {
    // Custom event from Admin save
    const onLocalUpdate = (e: any) => {
      const d = e?.detail || {};
      setBrand({
        logo_text: d.logo_text || "",
        gradient_token: d.gradient_token || "gradient-primary",
        text_token: d.text_token || "foreground",
        logo_image_url: d.logo_image_url || null,
        logo_variant: d.logo_variant || "text",
        logo_image_height: typeof d.logo_image_height === 'number' ? d.logo_image_height : 32,
        logo_icon_name: d.logo_icon_name || null,
        logo_icon_position: d.logo_icon_position || "top-right",
        logo_icon_size: d.logo_icon_size || "default",
      });
    };
    window.addEventListener('brand_settings_updated', onLocalUpdate);

    // Supabase realtime fallback (works if replication is enabled)
    const channel = supabase
      .channel('brand_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_settings' }, (payload) => {
        const d: any = (payload as any).new || {};
        setBrand({
          logo_text: d.logo_text || "",
          gradient_token: d.gradient_token || "gradient-primary",
          text_token: d.text_token || "foreground",
          logo_image_url: d.logo_image_url || null,
          logo_variant: d.logo_variant || "text",
          logo_image_height: typeof d.logo_image_height === 'number' ? d.logo_image_height : 32,
          logo_icon_name: d.logo_icon_name || null,
          logo_icon_position: d.logo_icon_position || "top-right",
          logo_icon_size: d.logo_icon_size || "default",
        });
      })
      .subscribe();

    return () => {
      window.removeEventListener('brand_settings_updated', onLocalUpdate);
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      window.location.href = "/auth";
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <HeadingTag className="m-0">
            <Link to="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
              {brand.logo_variant === 'image' && brand.logo_image_url ? (
                <img src={brand.logo_image_url} alt={brand.logo_text || "Brand logo"} className="w-auto" style={{ height: brand.logo_image_height || 32 }} />
              ) : (
                <span className={`${{ "gradient-primary": "bg-gradient-primary", "gradient-background": "bg-gradient-background", "gradient-hero": "bg-gradient-hero" }[brand.gradient_token] || "bg-gradient-primary"} bg-clip-text text-transparent relative inline-block pr-6`}>
                  {brand.logo_text || "Noddi Tech"}
                  {(() => {
                    if (!brand.logo_icon_name) return null;
                    const Icon = (icons as Record<string, any>)[brand.logo_icon_name];
                    if (!Icon) return null;
                    const sizeMap: Record<string, number> = { small: 16, default: 24, medium: 28, large: 32, xl: 40 };
                    const posMap: Record<string, string> = { 'top-right': 'top-0 -translate-y-1/2', 'middle-right': 'top-1/2 -translate-y-1/2', 'bottom-right': 'bottom-0 translate-y-1/2' };
                    const px = sizeMap[brand.logo_icon_size as keyof typeof sizeMap] ?? 24;
                    const posCls = posMap[brand.logo_icon_position as keyof typeof posMap] ?? 'top-0 -translate-y-1/2';
                    return <Icon className={`absolute right-0 translate-x-1/4 ${posCls}`} style={{ width: px, height: px }} />;
                  })()}
                </span>
              )}
            </Link>
          </HeadingTag>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/demo" className="text-foreground hover:text-primary transition-colors">
              Demo
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {authenticated ? (
              <Button variant="outline" onClick={signOut}>Sign out</Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hover:bg-muted/50">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/features" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Features
              </Link>
              <Link to="/demo" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Demo
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                {authenticated ? (
                  <Button variant="outline" onClick={() => { setIsMenuOpen(false); signOut(); }}>
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="hover:bg-muted/50 w-full">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 w-full">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}

        {/* Global USPs Bar */}
        <GlobalUSPBar />
      </div>
    </header>
  );
};

export default Header;