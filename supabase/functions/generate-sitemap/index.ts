import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Generate Sitemap Function Started ===');

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all enabled languages
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('code')
      .eq('enabled', true)
      .order('sort_order');

    if (langError) throw langError;

    // Get all published pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('published', true)
      .eq('active', true);

    if (pagesError) throw pagesError;

    const defaultDomain = 'https://naviosolutions.com';
    const today = new Date().toISOString();

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Add URLs for each page in each language
    for (const page of pages || []) {
      const pageSlug = page.slug === 'homepage' ? '/' : `/${page.slug}`;
      const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : today.split('T')[0];
      
      for (const lang of languages || []) {
        const url = lang.code === 'en' 
          ? `${defaultDomain}${pageSlug}`
          : `${defaultDomain}/${lang.code}${pageSlug}`;
        
        sitemap += '  <url>\n';
        sitemap += `    <loc>${url}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        
        // Add hreflang alternates
        for (const altLang of languages || []) {
          const altUrl = altLang.code === 'en'
            ? `${defaultDomain}${pageSlug}`
            : `${defaultDomain}/${altLang.code}${pageSlug}`;
          
          sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang.code}" href="${altUrl}" />\n`;
        }
        
        // Add x-default
        sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultDomain}${pageSlug}" />\n`;
        
        sitemap += '  </url>\n';
      }
    }

    sitemap += '</urlset>';

    console.log('=== Sitemap Generated Successfully ===');
    console.log(`Generated sitemap with ${(pages?.length || 0) * (languages?.length || 0)} URLs`);

    return new Response(sitemap, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    });

  } catch (error: any) {
    console.error('=== Sitemap Generation Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack?.substring(0, 200)
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
