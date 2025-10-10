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

  console.log('=== Translation Function Started ===');

  try {
    const { translationKeys, targetLanguages, sourceLanguage = 'en' } = await req.json();
    
    console.log('Request payload:', {
      keysCount: translationKeys?.length,
      targetLanguages,
      sourceLanguage
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasLovableKey: !!LOVABLE_API_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    });

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials missing');
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch source texts
    console.log(`Fetching ${translationKeys.length} source texts for language: ${sourceLanguage}`);
    
    const { data: sourceTexts, error: fetchError } = await supabase
      .from('translations')
      .select('translation_key, translated_text')
      .eq('language_code', sourceLanguage)
      .in('translation_key', translationKeys);

    if (fetchError) {
      console.error('Error fetching source texts:', fetchError);
      throw new Error(`Failed to fetch source texts: ${fetchError.message}`);
    }

    if (!sourceTexts || sourceTexts.length === 0) {
      console.error('No source texts found');
      throw new Error('No source texts found');
    }

    console.log(`Successfully fetched ${sourceTexts.length} source texts`);

    // Load TOV guide
    const tovGuide = `You are translating content for Noddi Tech, an automotive service technology platform.

TONE OF VOICE PRINCIPLES:
1. Intelligent Confidence - Expert but never condescending
2. Design-Led Simplicity - Clear, concise, jargon-free
3. Operational Directness - Action-focused, results-driven
4. Nordic Sass - Smart wit, never cute

RULES:
- Use declarative statements (not questions)
- Keep sentences short and punchy
- Avoid corporate buzzwords
- Maintain professional tone while being human
- Preserve ALL technical terms in English (e.g., "booking", "NPS", "whitelabel")
- Preserve ALL HTML tags and placeholders exactly as they appear
- Maintain the same level of formality as the source

When translating, adapt idioms and expressions naturally to the target language while preserving meaning and tone.`;

    const results = [];

    for (const targetLang of targetLanguages) {
      console.log(`\n=== Starting translation for: ${targetLang} ===`);

      const textsToTranslate = sourceTexts.map(t => ({
        key: t.translation_key,
        text: t.translated_text
      }));

      console.log(`Calling Lovable AI API for ${targetLang} with ${textsToTranslate.length} texts`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: tovGuide },
            { 
              role: 'user', 
              content: `Translate the following texts to ${targetLang}. Return ONLY valid JSON with the same keys:\n\n${JSON.stringify(textsToTranslate, null, 2)}`
            }
          ],
        }),
      });

      console.log(`AI API response status for ${targetLang}:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${targetLang} (${response.status}):`, errorText);
        
        if (response.status === 429) {
          results.push({
            language: targetLang,
            count: 0,
            status: 'error',
            error: 'Rate limit exceeded'
          });
          continue;
        } else if (response.status === 402) {
          results.push({
            language: targetLang,
            count: 0,
            status: 'error',
            error: 'Payment required - check Lovable AI credits'
          });
          continue;
        }
        
        results.push({
          language: targetLang,
          count: 0,
          status: 'error',
          error: `API error: ${response.status}`
        });
        continue;
      }

      const data = await response.json();
      const translatedContent = data.choices[0].message.content;
      
      console.log(`Received AI response for ${targetLang}, length: ${translatedContent?.length || 0}`);
      
      // Parse AI response
      let translations;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = translatedContent.match(/```json\n([\s\S]*?)\n```/);
        const jsonToParse = jsonMatch ? jsonMatch[1] : translatedContent;
        translations = JSON.parse(jsonToParse);
        console.log(`Successfully parsed ${translations.length} translations for ${targetLang}`);
      } catch (e) {
        console.error(`Failed to parse translations for ${targetLang}:`, e);
        console.error('Raw content:', translatedContent?.substring(0, 500));
        results.push({
          language: targetLang,
          count: 0,
          status: 'error',
          error: 'Failed to parse AI response'
        });
        continue;
      }

      // Insert translations into database
      console.log(`Preparing to upsert ${translations.length} records for ${targetLang}`);
      
      const translationRecords = translations.map((t: any) => ({
        translation_key: t.key,
        language_code: targetLang,
        translated_text: t.text,
        page_location: t.key.split('.')[0],
        approved: false,
      }));

      const { error: insertError } = await supabase
        .from('translations')
        .upsert(translationRecords, {
          onConflict: 'translation_key,language_code'
        });

      if (insertError) {
        console.error(`Database insert error for ${targetLang}:`, insertError);
        results.push({
          language: targetLang,
          count: 0,
          status: 'error',
          error: `Database error: ${insertError.message}`
        });
        continue;
      }

      console.log(`✓ Successfully inserted ${translations.length} translations for ${targetLang}`);
      
      results.push({
        language: targetLang,
        count: translations.length,
        status: 'success'
      });
    }

    console.log('\n=== Translation Complete ===');
    console.log('Results summary:', results);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== Translation Function Error ===');
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
