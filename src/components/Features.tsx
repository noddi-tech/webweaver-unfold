import { useEffect, useState } from "react";
import { icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageLink } from "@/components/LanguageLink";
import { useHeadings } from "@/hooks/useHeadings";
import { getTypographyClass } from "@/lib/typography";
import { getColorClass } from "@/lib/colorUtils";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableFeature } from "@/components/EditableFeature";
import { EditableBackground } from "@/components/EditableBackground";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";
import { EditableIcon } from "@/components/EditableIcon";

type IconName = keyof typeof icons;
interface DbFeature { id: string; title: string; description: string | null; icon_name: string; sort_order: number | null; }
interface FeatureSettings {
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  icon_token: string;
  title_token: string;
  description_token: string;
}

const bgClass: Record<string, string> = {
  background: "",
  card: "bg-card",
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
  white: "text-white",
  "white-90": "text-white/90",
  "white-80": "text-white/80",
  "gradient-primary": "bg-gradient-primary bg-clip-text text-transparent",
  "gradient-background": "bg-gradient-background bg-clip-text text-transparent",
  "gradient-hero": "bg-gradient-hero bg-clip-text text-transparent",
};
const borderClass: Record<string, string> = {
  border: "border-border",
};

interface FeaturesProps { useSectionBg?: boolean }
const Features = ({ useSectionBg = true }: FeaturesProps) => {
  const { getHeading, headings } = useHeadings('homepage', 'features');
  const [dbFeatures, setDbFeatures] = useState<DbFeature[] | null>(null);
  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [usps, setUsps] = useState<Array<{ id: string; title: string; icon_name: string; href: string | null; bg_token: string; text_token: string }>>([]);
  const { allowedBackgrounds } = useAllowedBackgrounds();
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [{ data: feats }, { data: setts }, { data: uspList }] = await Promise.all([
        supabase
          .from("features")
          .select("id,title,description,icon_name,sort_order")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("features_settings")
          .select("section_title,section_subtitle,background_token,card_bg_token,border_token,icon_token,title_token,description_token")
          .order("created_at", { ascending: true })
          .limit(1),
        supabase
          .from("usps")
          .select("id,title,icon_name,href,bg_token,text_token,active,sort_order")
          .eq("active", true)
          .eq("location", "features")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);
      if (!mounted) return;
      setDbFeatures(feats || []);
      setSettings((setts && setts[0]) || null);
      setUsps(uspList || []);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const showFeatures = dbFeatures && dbFeatures.length > 0;
  const bg = settings && useSectionBg ? (bgClass[settings.background_token] || "") : "";
  const cardBg = settings ? (bgClass[settings.card_bg_token] || "bg-card") : "bg-card";
  const iconClr = settings ? (textClass[settings.icon_token] || "text-primary") : "text-primary";
  const titleClr = settings ? (textClass[settings.title_token] || "text-white") : "text-white";
  const descClr = settings ? (textClass[settings.description_token] || "text-white/90") : "text-white/90";
  const borderClr = settings ? (borderClass[settings.border_token] || "border-border") : "border-border";

  return (
    <section id="features" className="py-20 px-6">
      <div className={`container mx-auto ${useSectionBg ? bg + " rounded-2xl p-6 md:p-10" : ""}`}>
        <div>
          {/* Section Header */}
          <div className="text-center mb-16">
            {(() => {
              const h2Heading = headings.find(h => h.element_type === 'h2');
              const h2Class = h2Heading?.color_token ? 
                `${getTypographyClass('h2')} mb-6 ${getColorClass(h2Heading.color_token)}` : 
                'text-4xl md:text-5xl font-bold mb-6 gradient-text';
              
              const subtitleHeading = headings.find(h => h.element_type === 'subtitle');
              const subtitleClass = subtitleHeading?.color_token ? 
                `${getTypographyClass('subtitle')} max-w-3xl mx-auto ${getColorClass(subtitleHeading.color_token)}` : 
                `text-xl max-w-3xl mx-auto text-muted-foreground`;
              
              return (
                <>
                  <h2 className={h2Class}>
                    <EditableTranslation translationKey="homepage.features.h2">
                      {getHeading('h2', settings?.section_title || 'Stand out with mobile services')}
                    </EditableTranslation>
                  </h2>
                  <p className={subtitleClass}>
                    <EditableTranslation translationKey="homepage.features.subtitle">
                      {getHeading('subtitle', settings?.section_subtitle || 'Our platform coordinates the operations, so you can take the lead on your market')}
                    </EditableTranslation>
                  </p>
                </>
              );
            })()}
          </div>

        {/* Feature-targeted USPs */}
        {usps.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {usps.map((u) => {
              const IconCmp = icons[(u.icon_name as IconName)] || icons["Sparkles"];
              const pill = (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${borderClr} ${bgClass[u.bg_token] || "bg-secondary"} ${textClass[u.text_token] || "text-foreground"}`}>
                  <IconCmp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {u.title}
                  </span>
                </div>
              );
              return u.href ? (
                <LanguageLink key={u.id} to={u.href} className="shrink-0 hover:opacity-90 transition-opacity">
                  {pill}
                </LanguageLink>
              ) : (
                <span key={u.id} className="shrink-0">{pill}</span>
              );
            })}
          </div>
        )}

        {/* Features Grid */}
        {showFeatures && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dbFeatures!.map((f) => {
              const Icon = icons[(f.icon_name as IconName)] || icons["Sparkles"];
              return (
                <EditableBackground
                  key={f.id}
                  elementId={`feature-card-${f.id}`}
                  defaultBackground={cardBg}
                  allowedBackgrounds={allowedBackgrounds}
                >
                  <div className={`rounded-xl p-6 hover:scale-105 transition-transform duration-300 border shadow-sm`}>
                    <EditableIcon
                      elementId={`feature-icon-${f.id}`}
                      icon={Icon}
                      defaultBackground="bg-gradient-primary"
                      size="default"
                      className="mb-4"
                    />
                    <h3 className={`text-xl font-semibold mb-3 ${titleClr}`}>
                      <EditableFeature featureId={f.id} field="title">
                        {f.title}
                      </EditableFeature>
                    </h3>
                    <p className={`${descClr}`}>
                      <EditableFeature featureId={f.id} field="description">
                        {f.description}
                      </EditableFeature>
                    </p>
                  </div>
                </EditableBackground>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};

export default Features;
