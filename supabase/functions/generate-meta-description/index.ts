import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const MetaDescriptionRequestSchema = z.object({
  pageSlug: z.string().min(1).max(200).regex(/^[a-z0-9\-\/]+$/),
  metaTitle: z.string().min(1).max(500).trim(),
  language: z.string().min(2).max(10).regex(/^[a-z]{2}(-[A-Z]{2})?$/)
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Generate Meta Description Function Started ===');

  try {
    const body = await req.json();
    
    // Validate input
    const validation = MetaDescriptionRequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error.format());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request parameters',
          details: validation.error.format()
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pageSlug, metaTitle, language } = validation.data;
    
    console.log('Request payload:', {
      pageSlug,
      metaTitle,
      language
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create SEO-optimized prompt
    const seoPrompt = `You are an expert SEO copywriter for Navio, an automotive service technology platform.

Page: ${pageSlug}
Title: ${metaTitle}
Language: ${language}

Write a compelling meta description (150-160 characters) that:
1. Includes the main keyword from the title naturally
2. Clearly states the page's value proposition
3. Creates urgency or curiosity to click
4. Matches Navio's tone: confident, clear, direct (no corporate buzzwords)
5. Is grammatically perfect in ${language}

For Navio pages:
- Homepage: Focus on transforming automotive service, intelligent booking, NPS tracking
- Pricing: Emphasize transparency, no hidden costs, ROI
- Features: Highlight specific capabilities and benefits
- Contact: Invite action, emphasize support and expertise

Return a JSON object with:
{
  "meta_description": "your 150-160 char description",
  "quality_score": 85,
  "reasoning": "brief explanation of why this works"
}`;

    console.log('Calling Lovable AI for meta description generation');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert SEO copywriter. Always return valid JSON.' },
          { role: 'user', content: seoPrompt }
        ],
      }),
    });

    console.log(`AI API response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required - check Lovable AI credits' }), 
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Received AI response, length:', aiResponse?.length || 0);
    
    // Parse AI response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      const jsonToParse = jsonMatch ? jsonMatch[1] : aiResponse;
      result = JSON.parse(jsonToParse);
      console.log('Successfully parsed AI response');
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      console.error('Raw content:', aiResponse?.substring(0, 500));
      throw new Error('Failed to parse AI response');
    }

    // Validate meta description length
    if (result.meta_description && result.meta_description.length > 160) {
      console.warn('Meta description too long, truncating');
      result.meta_description = result.meta_description.substring(0, 157) + '...';
    }

    console.log('=== Generation Complete ===');
    console.log('Meta Description:', result.meta_description);
    console.log('Quality Score:', result.quality_score);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== Function Error ===');
    console.error('Error type:', error.constructor.name);
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
