import { Button } from "@/components/ui/button";
import { Menu, X, icons, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import GlobalUSPBar from "@/components/GlobalUSPBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LanguageLink } from "@/components/LanguageLink";
import { UserMenuDropdown } from "@/components/UserMenuDropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [brand, setBrand] = useState({ logo_text: "", gradient_token: "gradient-primary", text_token: "foreground", logo_image_url: null as string | null, logo_variant: "text", logo_image_height: 32, logo_icon_name: null as string | null, logo_icon_position: "top-right", logo_icon_size: "default" });
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [dynamicDropdowns, setDynamicDropdowns] = useState<Record<number, any[]>>({});
  const location = useLocation();
  const isHome = location.pathname === "/";
  const HeadingTag = (isHome ? "h1" : "h2") as keyof JSX.IntrinsicElements;
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [brandData, headerData] = await Promise.all([
        supabase
          .from("brand_settings")
          .select("logo_text,gradient_token,text_token,logo_image_url,logo_variant,logo_image_height,logo_icon_name,logo_icon_position,logo_icon_size")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("header_settings")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      ]);
      
      if (!mounted) return;
      
      if (brandData.data) {
        setBrand({
          logo_text: brandData.data.logo_text || "",
          gradient_token: brandData.data.gradient_token || "gradient-primary",
          text_token: brandData.data.text_token || "foreground",
          logo_image_url: brandData.data.logo_image_url || null,
          logo_variant: brandData.data.logo_variant || "text",
          logo_image_height: typeof (brandData.data as any).logo_image_height === 'number' ? (brandData.data as any).logo_image_height : 32,
          logo_icon_name: (brandData.data as any).logo_icon_name || null,
          logo_icon_position: (brandData.data as any).logo_icon_position || "top-right",
          logo_icon_size: (brandData.data as any).logo_icon_size || "default",
        });
      }
      
      setHeaderSettings(headerData.data);
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Fetch dynamic dropdown items
  useEffect(() => {
    if (!headerSettings?.navigation_links) return;

    const fetchDynamicItems = async () => {
      const dynamicLinks = headerSettings.navigation_links
        .map((link: any, index: number) => ({ link, index }))
        .filter(({ link }: any) => link.type === 'dynamic-dropdown' && link.collection);

      const results: Record<number, any[]> = {};

      for (const { link, index } of dynamicLinks) {
        try {
          let query = supabase.from(link.collection).select('*').eq('active', true);
          
          // Add sort order if available
          if (['solutions', 'features'].includes(link.collection)) {
            query = query.order('sort_order', { ascending: true });
          }
          
          const { data, error } = await query;
          
          if (!error && data) {
            results[index] = data;
          }
        } catch (error) {
          console.error(`Error fetching ${link.collection}:`, error);
        }
      }

      setDynamicDropdowns(results);
    };

    fetchDynamicItems();
  }, [headerSettings]);

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
      window.location.href = "/cms-login";
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  if (!brand.logo_text && !brand.logo_image_url) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <HeadingTag className="m-0">
            <LanguageLink to="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
              {brand.logo_variant === 'image' && brand.logo_image_url ? (
                <img src={brand.logo_image_url} alt={brand.logo_text || "Brand logo"} className="w-auto" style={{ height: brand.logo_image_height || 32 }} />
              ) : (
                <span className={`${{ "gradient-primary": "bg-gradient-primary", "gradient-background": "bg-gradient-background", "gradient-hero": "bg-gradient-hero" }[brand.gradient_token] || "bg-gradient-primary"} bg-clip-text text-transparent relative inline-block`} style={{ paddingRight: brand.logo_icon_name ? (({ small: 16, default: 24, medium: 28, large: 32, xl: 40 } as Record<string, number>)[brand.logo_icon_size || "default"] + 4) : undefined }}>
                  {brand.logo_text}
                  {(() => {
                    if (!brand.logo_icon_name) return null;
                    const Icon = (icons as Record<string, any>)[brand.logo_icon_name];
                    if (!Icon) return null;
                    const sizeMap: Record<string, number> = { small: 16, default: 24, medium: 28, large: 32, xl: 40 };
                    const posMap: Record<string, string> = { 'top-right': 'top-0 -translate-y-1/2', 'middle-right': 'top-1/2 -translate-y-1/2', 'bottom-right': 'bottom-0 translate-y-1/2' };
                    const px = sizeMap[brand.logo_icon_size as keyof typeof sizeMap] ?? 24;
                    const posCls = posMap[brand.logo_icon_position as keyof typeof posMap] ?? 'top-0 -translate-y-1/2';
                    return <Icon className={`absolute right-0 ${posCls} ${({"foreground":"text-foreground","muted-foreground":"text-muted-foreground","primary":"text-primary","secondary":"text-secondary","accent":"text-accent"} as Record<string,string>)[brand.text_token] || "text-foreground"}`} style={{ width: px, height: px }} />;
                  })()}
                </span>
              )}
            </LanguageLink>
          </HeadingTag>

          {/* Desktop Navigation */}
          {headerSettings?.navigation_links && headerSettings.navigation_links.length > 0 && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {headerSettings.navigation_links.map((link: any, originalIndex: number) => link.active ? { link, originalIndex } : null).filter(Boolean).map(({ link, originalIndex }: any) => {
                  const dropdownItems = (link.type === 'static-dropdown' || link.type === 'dropdown')
                    ? link.children?.filter((child: any) => child.active) || []
                    : link.type === 'dynamic-dropdown' 
                    ? (dynamicDropdowns[originalIndex] || []).map((item: any) => ({
                        title: item.title || item.name,
                        url: `/${link.collection}/${item.slug || item.id}`,
                        description: item.subtitle || item.description,
                        active: true
                      }))
                    : [];

                  return (
                    <NavigationMenuItem key={originalIndex}>
                      {((link.type === 'static-dropdown' || link.type === 'dropdown' || link.type === 'dynamic-dropdown') && dropdownItems.length > 0) ? (
                        <>
                          <NavigationMenuTrigger className="bg-transparent data-[state=open]:animate-none data-[state=closed]:animate-none">
                            {link.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="data-[state=open]:animate-none data-[state=closed]:animate-none transition-none">
                            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                              {dropdownItems.map((child: any, childIndex: number) => (
                                <LanguageLink
                                  key={childIndex}
                                  to={child.url}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-base font-bold leading-none">{child.title}</div>
                                  {child.description && (
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  )}
                                </LanguageLink>
                              ))}
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <LanguageLink 
                            to={link.url || '#'} 
                            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                          >
                            {link.title}
                          </LanguageLink>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* CTA Buttons - Hidden for clean public interface */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher variant="header" />
            {user && <UserMenuDropdown user={user} />}
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
        {isMenuOpen && headerSettings?.navigation_links && headerSettings.navigation_links.length > 0 && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-2">
              {headerSettings.navigation_links.map((link: any, originalIndex: number) => link.active ? { link, originalIndex } : null).filter(Boolean).map(({ link, originalIndex }: any) => {
                const dropdownItems = (link.type === 'static-dropdown' || link.type === 'dropdown')
                  ? link.children?.filter((child: any) => child.active) || []
                  : link.type === 'dynamic-dropdown' 
                  ? (dynamicDropdowns[originalIndex] || []).map((item: any) => ({
                      title: item.title || item.name,
                      url: `/${link.collection}/${item.slug || item.id}`,
                      description: item.subtitle || item.description,
                      active: true
                    }))
                  : [];

                return (
                  <div key={originalIndex}>
                    {((link.type === 'static-dropdown' || link.type === 'dropdown' || link.type === 'dynamic-dropdown') && dropdownItems.length > 0) ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === originalIndex ? null : originalIndex)}
                          className="w-full flex items-center justify-between text-foreground hover:text-primary transition-colors py-2 text-base"
                        >
                          <span>{link.title}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === originalIndex ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === originalIndex && (
                          <div className="pl-4 space-y-2 border-l-2 border-border">
                            {dropdownItems.map((child: any, childIndex: number) => (
                              <LanguageLink
                                key={childIndex}
                                to={child.url}
                                className="block text-base text-foreground hover:text-primary transition-colors py-1"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.title}
                              </LanguageLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <LanguageLink 
                        to={link.url || '#'} 
                        className="block text-foreground hover:text-primary transition-colors py-2 text-base" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.title}
                      </LanguageLink>
                    )}
                  </div>
                );
              })}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <LanguageSwitcher variant="header" />
                {user && (
                  <div className="flex items-center justify-between">
                    <UserMenuDropdown user={user} />
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}

        {/* Global USPs Bar */}
        {headerSettings?.show_global_usp_bar && <GlobalUSPBar />}
      </div>
    </header>
  );
};

export default Header;