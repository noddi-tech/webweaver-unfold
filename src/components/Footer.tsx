import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LanguageLink } from "@/components/LanguageLink";
import { useAppTranslation } from "@/hooks/useAppTranslation";

const Footer = () => {
  const { t } = useAppTranslation();
  const [footerSettings, setFooterSettings] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("footer_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      setFooterSettings(data);
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
            <div className="text-2xl font-bold gradient-text mb-4">
              {t('footer.company_name', footerSettings.company_name)}
            </div>
            {(footerSettings.company_description || t('footer.company_description')) && (
              <p className="text-muted-foreground mb-6 max-w-md">
                {t('footer.company_description', footerSettings.company_description)}
              </p>
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
              <h4 className="font-semibold text-foreground mb-4">
                {t('footer.quick_links_heading', 'Quick Links')}
              </h4>
              <ul className="space-y-2">
                {footerSettings.quick_links.map((link: any, index: number) => (
                  <li key={index}>
                    <LanguageLink to={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                      {t(link.title, link.title)}
                    </LanguageLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal */}
          {footerSettings.legal_links && footerSettings.legal_links.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                {t('footer.legal_heading', 'Legal')}
              </h4>
              <ul className="space-y-2">
                {footerSettings.legal_links.map((link: any, index: number) => (
                  <li key={index}>
                    <LanguageLink to={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                      {t(link.title, link.title)}
                    </LanguageLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(footerSettings.copyright_text || t('footer.copyright')) && (
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>{t('footer.copyright', footerSettings.copyright_text)}</p>
          </div>
        )}
      </div>
      </div>
    </footer>
  );
};

export default Footer;