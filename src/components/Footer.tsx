import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LanguageLink } from "@/components/LanguageLink";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

const Footer = () => {
  const { t } = useAppTranslation();
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const [brand, setBrand] = useState<{
    logo_image_url: string | null;
    logo_variant: string;
    logo_text: string | null;
    logo_image_height: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [brandData, footerData] = await Promise.all([
        supabase.from("brand_settings")
          .select("logo_image_url, logo_variant, logo_text, logo_image_height")
          .limit(1)
          .maybeSingle(),
        supabase.from("footer_settings")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      ]);
      
      if (!mounted) return;
      
      if (brandData.data) {
        setBrand(brandData.data);
      }
      
      if (footerData.data) {
        setFooterSettings(footerData.data);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!footerSettings) return null;

  return (
    <footer className="pt-16 pb-2.5 px-2.5">
      {/* Card-encapsulated gradient section */}
      <div className="rounded-3xl overflow-hidden relative">
        {/* Gradient background inside card - reversed (gradient to white at top) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, hsl(266 85% 58% / 0.85) 0%, hsl(321 59% 85% / 0.5) 45%, white 100%)'
          }}
        />
        
        <div className="container mx-auto relative z-10 py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            {/* Logo - displayed ABOVE the description */}
            {brand?.logo_variant === 'image' && brand?.logo_image_url ? (
              <img 
                src={brand.logo_image_url} 
                alt={brand.logo_text || "Logo"} 
                className="mb-4 w-auto"
                style={{ height: brand.logo_image_height || 40 }}
              />
            ) : (
              <EditableTranslation translationKey="footer.company_name">
                <div className="text-2xl font-bold gradient-text mb-4">
                  {footerSettings.company_name}
                </div>
              </EditableTranslation>
            )}
            
            {footerSettings.company_description && (
              <EditableTranslation translationKey="footer.company_description">
                <p className="text-muted-foreground mb-6 max-w-md">
                  {footerSettings.company_description}
                </p>
              </EditableTranslation>
            )}
            {footerSettings.contact_info && footerSettings.contact_info.length > 0 && (
              <div className="space-y-2">
                {footerSettings.contact_info.map((contact: any, index: number) => {
                  const IconComponent = contact.icon && (Icons as any)[contact.icon] ? (Icons as any)[contact.icon] : Icons.Mail;
                  // Translate contact label - empty strings will hide the label (icon only)
                  const contactLabel = contact.title ? t(contact.title, contact.title) : '';
                  return (
                    <div key={index} className="flex items-center text-muted-foreground">
                      <IconComponent className="w-4 h-4 mr-2 shrink-0" />
                      {contactLabel && <span className="mr-2 text-sm font-medium">{contactLabel}:</span>}
                      {contact.link ? (
                        <a href={contact.link} className="hover:text-primary transition-colors">
                          {contact.value}
                        </a>
                      ) : (
                        contact.value
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {footerSettings.quick_links && footerSettings.quick_links.length > 0 && (
            <div>
              <EditableTranslation translationKey="footer.quick_links_heading">
                <h4 className="font-semibold text-foreground mb-4">
                  Quick Links
                </h4>
              </EditableTranslation>
            <ul className="space-y-2">
              {footerSettings.quick_links.filter((link: any) => link.active).map((link: any, index: number) => (
                <li key={index}>
                  <EditableTranslation translationKey={`footer.quick_links.${index}`}>
                    <LanguageLink to={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                      {t(link.title, link.title)}
                    </LanguageLink>
                  </EditableTranslation>
                </li>
              ))}
            </ul>
            </div>
          )}

          {/* Legal */}
          {footerSettings.legal_links && footerSettings.legal_links.length > 0 && (
            <div>
              <EditableTranslation translationKey="footer.legal_heading">
                <h4 className="font-semibold text-foreground mb-4">
                  Legal
                </h4>
              </EditableTranslation>
            <ul className="space-y-2">
              {footerSettings.legal_links.filter((link: any) => link.active).map((link: any, index: number) => (
                <li key={index}>
                  <EditableTranslation translationKey={`footer.legal_links.${index}`}>
                    <LanguageLink to={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                      {t(link.title, link.title)}
                    </LanguageLink>
                  </EditableTranslation>
                </li>
              ))}
            </ul>
            </div>
          )}
        </div>

        {footerSettings.copyright_text && (
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <EditableTranslation translationKey="footer.copyright">
              <p>{footerSettings.copyright_text}</p>
            </EditableTranslation>
          </div>
        )}
      </div>
      </div>
    </footer>
  );
};

export default Footer;