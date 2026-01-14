import { useEffect, useState } from "react";
import { icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageLink } from "@/components/LanguageLink";
import { EditableCard, useEditableCardContext } from "@/components/EditableCard";
import { EditableTranslation } from "@/components/EditableTranslation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useBackgroundTextColor } from "@/contexts/BackgroundTextColorContext";
import { cn } from "@/lib/utils";
import { resolveTextColor } from "@/lib/textColorUtils";

type IconName = keyof typeof icons;

interface Solution {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  hero_description: string | null;
  icon_name: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  benefits: string[];
  sort_order: number;
}

interface SolutionSettings {
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  icon_token: string;
  title_token: string;
  subtitle_token: string;
  description_token: string;
}

// Convert slug format (tire-services) to translation key format (tire_services)
const slugToKey = (slug: string) => slug.replace(/-/g, '_');

// Card content component that uses context for text colors
function SolutionCardContent({ solution, slugKey }: { solution: Solution; slugKey: string }) {
  const { t } = useAppTranslation();
  const { textColor, iconColor, iconSize } = useEditableCardContext();
  const Icon = icons[(solution.icon_name as IconName)] || icons["Sparkles"];
  
  // Resolve colors to inline styles
  const textStyle = { color: resolveTextColor(textColor) };
  const iconStyle = { color: resolveTextColor(iconColor) };
  const mutedStyle = { color: resolveTextColor(textColor), opacity: 0.8 };
  
  // Map icon size to Tailwind classes
  const iconSizeClass = cn(
    iconSize === 'small' && 'w-4 h-4',
    iconSize === 'default' && 'w-6 h-6',
    iconSize === 'medium' && 'w-8 h-8',
    iconSize === 'large' && 'w-12 h-12',
    iconSize === 'xl' && 'w-16 h-16',
    !['small', 'default', 'medium', 'large', 'xl'].includes(iconSize) && 'w-12 h-12'
  );

  return (
    <LanguageLink 
      to={`/solutions/${solution.slug}`} 
      className="block h-full"
    >
      {/* Transparent inner div - background comes from parent EditableCard */}
      <div className="p-8 border border-white/10 h-full min-h-[420px] flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer">
        {/* Icon */}
        <div className="mb-6">
          <Icon className={iconSizeClass} style={iconStyle} />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-3xl font-bold mb-2" style={textStyle}>
          {t(`solutions.${slugKey}.title`, solution.title)}
        </h2>
        {solution.subtitle && (
          <p className="text-lg mb-4 font-medium" style={{ ...textStyle, opacity: 0.9 }}>
            {t(`solutions.${slugKey}.subtitle`, solution.subtitle)}
          </p>
        )}

        {/* Description - flex-grow to push content to bottom */}
        <div className="flex-grow">
          {solution.hero_description && (
            <p className="mb-6 leading-relaxed" style={mutedStyle}>
              {t(`solutions.${slugKey}.hero_description`, solution.hero_description)}
            </p>
          )}

          {/* Benefits */}
          {solution.benefits && solution.benefits.length > 0 && (
            <ul className="space-y-3 mb-6">
              {solution.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2" style={mutedStyle}>
                  <icons.Check className="w-5 h-5 shrink-0 mt-0.5" style={iconStyle} />
                  <span>{t(`solutions.${slugKey}.benefit_${idx}`, benefit)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Image */}
        {solution.image_url && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={solution.image_url}
              alt={t(`solutions.${slugKey}.title`, solution.title)}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* CTA indicator at bottom */}
        <div className="mt-auto pt-6 border-t border-border/30">
          <span 
            className="inline-flex items-center text-sm font-semibold group-hover:gap-3 transition-all"
            style={textStyle}
          >
            {t('solutions.page.learn_more', solution.cta_text || 'Learn More')}
            <icons.ArrowRight className="w-4 h-4 ml-2" />
          </span>
        </div>
      </div>
    </LanguageLink>
  );
}

const Solutions = () => {
  const { t } = useAppTranslation();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [settings, setSettings] = useState<SolutionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [{ data: sols }, { data: setts }] = await Promise.all([
      supabase
        .from("solutions")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("solutions_settings")
        .select("*")
        .limit(1),
    ]);

    setSolutions((sols || []).map(s => ({
      ...s,
      benefits: (Array.isArray(s.benefits) ? s.benefits : []) as string[]
    })));
    setSettings((setts && setts[0]) || null);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">{t('solutions.page.loading', 'Loading solutions...')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - responsive padding for header clearance */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 px-6" data-header-color="dark">
        <div className="container mx-auto max-w-4xl text-center">
          <EditableTranslation
            translationKey="solutions.page.title"
            className="text-5xl md:text-6xl font-bold mb-6 text-foreground"
            fallbackText={settings?.section_title || 'Solutions'}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              {t('solutions.page.title', settings?.section_title || 'Solutions')}
            </h1>
          </EditableTranslation>
          {settings?.section_subtitle && (
            <EditableTranslation
              translationKey="solutions.page.subtitle"
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              fallbackText={settings.section_subtitle}
            >
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('solutions.page.subtitle', settings.section_subtitle)}
              </p>
            </EditableTranslation>
          )}
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 px-6 pb-32" data-header-color="dark">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution) => {
              const slugKey = slugToKey(solution.slug);
              
              return (
                <EditableCard
                  key={solution.id}
                  elementIdPrefix={`solution-card-${solution.id}`}
                  defaultBackground="bg-gradient-hero"
                  defaultTextColor="white"
                  className="group"
                >
                  <SolutionCardContent solution={solution} slugKey={slugKey} />
                </EditableCard>
              );
            })}
          </div>

          {/* Empty State */}
          {solutions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {t('solutions.page.empty', 'No solutions available yet. Check back soon!')}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;
