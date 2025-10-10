import { useEffect, useState } from 'react';
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

  // Apply meta tags directly to DOM
  useEffect(() => {
    if (!pageMeta || languages.length === 0) return;

    const canonicalUrl = pageMeta.canonical_url || 
      `${defaultDomain}${lang !== 'en' ? `/${lang}` : ''}${pageSlug === '/' ? '' : pageSlug}`;

    // Update title
    document.title = pageMeta.meta_title;

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, content: string, property?: string) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', property);
        } else {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) meta.setAttribute('name', nameMatch[1]);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let link = document.querySelector(selector);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (hreflang) link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Update basic meta tags
    if (pageMeta.meta_description) {
      updateMetaTag('meta[name="description"]', pageMeta.meta_description);
    }
    if (pageMeta.meta_keywords) {
      updateMetaTag('meta[name="keywords"]', pageMeta.meta_keywords);
    }

    // Update canonical
    updateLinkTag('canonical', canonicalUrl);

    // Update hreflang tags
    languages.forEach(langCode => {
      const href = `${defaultDomain}${langCode !== 'en' ? `/${langCode}` : ''}${pageSlug === '/' ? '' : pageSlug}`;
      updateLinkTag('alternate', href, langCode);
    });
    updateLinkTag('alternate', `${defaultDomain}${pageSlug === '/' ? '' : pageSlug}`, 'x-default');

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', pageMeta.og_title || pageMeta.meta_title, 'og:title');
    if (pageMeta.og_description || pageMeta.meta_description) {
      updateMetaTag('meta[property="og:description"]', pageMeta.og_description || pageMeta.meta_description || '', 'og:description');
    }
    if (pageMeta.og_image_url) {
      updateMetaTag('meta[property="og:image"]', pageMeta.og_image_url, 'og:image');
    }
    updateMetaTag('meta[property="og:url"]', canonicalUrl, 'og:url');
    updateMetaTag('meta[property="og:type"]', 'website', 'og:type');
    updateMetaTag('meta[property="og:locale"]', lang, 'og:locale');

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', pageMeta.twitter_title || pageMeta.og_title || pageMeta.meta_title);
    if (pageMeta.twitter_description || pageMeta.og_description || pageMeta.meta_description) {
      updateMetaTag('meta[name="twitter:description"]', pageMeta.twitter_description || pageMeta.og_description || pageMeta.meta_description || '');
    }
    if (pageMeta.twitter_image_url || pageMeta.og_image_url) {
      updateMetaTag('meta[name="twitter:image"]', pageMeta.twitter_image_url || pageMeta.og_image_url || '');
    }

    // Update html lang attribute
    document.documentElement.setAttribute('lang', lang);
  }, [pageMeta, languages, lang, pageSlug, defaultDomain]);

  return null;
}
