import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";

const Footer = () => {
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
    <footer className="py-16 px-6 border-t border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold gradient-text mb-4">
              {footerSettings.company_name}
            </div>
            {footerSettings.company_description && (
              <p className="text-muted-foreground mb-6 max-w-md">
                {footerSettings.company_description}
              </p>
            )}
            {footerSettings.contact_info && footerSettings.contact_info.length > 0 && (
              <div className="space-y-2">
                {footerSettings.contact_info.map((contact: any, index: number) => {
                  const IconComponent = contact.icon && (Icons as any)[contact.icon] ? (Icons as any)[contact.icon] : Icons.Mail;
                  return (
                    <div key={index} className="flex items-center text-muted-foreground">
                      <IconComponent className="w-4 h-4 mr-2 shrink-0" />
                      <span className="mr-2 text-sm font-medium">{contact.title}:</span>
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
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerSettings.quick_links.map((link: any, index: number) => (
                  <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal */}
          {footerSettings.legal_links && footerSettings.legal_links.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerSettings.legal_links.map((link: any, index: number) => (
                  <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {footerSettings.copyright_text && (
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>{footerSettings.copyright_text}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;