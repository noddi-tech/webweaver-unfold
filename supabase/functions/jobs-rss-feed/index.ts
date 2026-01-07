import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = "https://noddi.tech";
const SITE_NAME = "Navio";

function formatRFC822Date(dateString: string | null): string {
  if (!dateString) return new Date().toUTCString();
  return new Date(dateString).toUTCString();
}

function escapeXml(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active job listings
    const { data: jobs, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('active', true)
      .order('posted_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    console.log(`Generating RSS feed for ${jobs?.length || 0} active jobs`);

    const now = new Date().toUTCString();
    const feedUrl = `${SITE_URL}/careers/feed.xml`;
    const careersUrl = `${SITE_URL}/en/careers`;

    // Build RSS items
    const items = (jobs || []).map(job => {
      const jobUrl = `${SITE_URL}/en/careers/${job.slug}`;
      const description = stripHtml(job.description);
      const fullContent = [
        job.description,
        job.requirements ? `\n\nRequirements:\n${job.requirements}` : '',
        job.benefits ? `\n\nBenefits:\n${job.benefits}` : '',
        job.salary_range ? `\n\nSalary: ${job.salary_range}` : '',
        job.location ? `\n\nLocation: ${job.location}` : '',
        job.employment_type ? `\n\nType: ${job.employment_type}` : '',
      ].join('');

      return `    <item>
      <title>${escapeXml(job.title)}</title>
      <link>${jobUrl}</link>
      <description><![CDATA[${stripHtml(fullContent)}]]></description>
      ${job.department ? `<category>${escapeXml(job.department)}</category>` : ''}
      <pubDate>${formatRFC822Date(job.posted_at)}</pubDate>
      <guid isPermaLink="true">${jobUrl}</guid>
    </item>`;
    }).join('\n');

    // Build complete RSS feed
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Careers - Job Openings</title>
    <link>${careersUrl}</link>
    <description>Latest job opportunities at ${SITE_NAME}. Join our team and help shape the future of automotive services.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>${SITE_NAME} Careers</title>
      <link>${careersUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate feed</error>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      }
    );
  }
});
