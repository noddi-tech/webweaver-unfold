import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HreflangTagsProps {
  pageSlug: string;
}

interface PageMeta {
  meta_title: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  canonical_url?: string;
}

export function HreflangTags({ pageSlug }: HreflangTagsProps) {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const [languages, setLanguages] = useState<string[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [defaultDomain] = useState('https://noddi.tech');

  useEffect(() => {
    async function loadLanguagesAndMeta() {
      // Get all enabled languages
      const { data: enabledLangs } = await supabase
        .from('languages')
        .select('code')
        .eq('enabled', true)
        .order('sort_order');

      if (enabledLangs) {
        setLanguages(enabledLangs.map(l => l.code));
      }

      // Get page meta for current language
      const { data: meta } = await supabase
        .from('page_meta_translations' as any)
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language_code', lang)
        .maybeSingle();

      if (meta) {
        setPageMeta(meta as unknown as PageMeta);
      } else {
        // Fallback to English meta if translation doesn't exist
        const { data: fallbackMeta } = await supabase
          .from('page_meta_translations' as any)
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('language_code', 'en')
          .maybeSingle();
        
        if (fallbackMeta) {
          setPageMeta(fallbackMeta as unknown as PageMeta);
        }
      }
    }

    loadLanguagesAndMeta();
  }, [pageSlug, lang]);

  // Generate canonical URL
  const canonicalUrl = pageMeta?.canonical_url || 
    `${defaultDomain}${lang !== 'en' ? `/${lang}` : ''}${pageSlug === '/' ? '' : pageSlug}`;

  // Generate hreflang alternates
  const hreflangLinks = languages.map(langCode => {
    const href = `${defaultDomain}${langCode !== 'en' ? `/${langCode}` : ''}${pageSlug === '/' ? '' : pageSlug}`;
    return { rel: 'alternate', hreflang: langCode, href };
  });

  // Add x-default (usually points to English version)
  hreflangLinks.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${defaultDomain}${pageSlug === '/' ? '' : pageSlug}`
  });

  if (!pageMeta) return null;

  return (
    <Helmet>
      {/* Title */}
      <title>{pageMeta.meta_title}</title>
      
      {/* Meta Description */}
      {pageMeta.meta_description && (
        <meta name="description" content={pageMeta.meta_description} />
      )}
      
      {/* Meta Keywords */}
      {pageMeta.meta_keywords && (
        <meta name="keywords" content={pageMeta.meta_keywords} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang Tags */}
      {hreflangLinks.map(link => (
        <link 
          key={link.hreflang} 
          rel={link.rel} 
          hrefLang={link.hreflang} 
          href={link.href} 
        />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={pageMeta.og_title || pageMeta.meta_title} />
      {(pageMeta.og_description || pageMeta.meta_description) && (
        <meta property="og:description" content={pageMeta.og_description || pageMeta.meta_description} />
      )}
      {pageMeta.og_image_url && (
        <meta property="og:image" content={pageMeta.og_image_url} />
      )}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={lang} />
      {languages
        .filter(l => l !== lang)
        .map(l => (
          <meta key={l} property="og:locale:alternate" content={l} />
        ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageMeta.twitter_title || pageMeta.og_title || pageMeta.meta_title} />
      {(pageMeta.twitter_description || pageMeta.og_description || pageMeta.meta_description) && (
        <meta name="twitter:description" content={pageMeta.twitter_description || pageMeta.og_description || pageMeta.meta_description} />
      )}
      {(pageMeta.twitter_image_url || pageMeta.og_image_url) && (
        <meta name="twitter:image" content={pageMeta.twitter_image_url || pageMeta.og_image_url} />
      )}
      
      {/* Language */}
      <html lang={lang} />
    </Helmet>
  );
}
