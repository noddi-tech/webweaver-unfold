import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { translationKeys, targetLanguages, sourceLanguage = 'en' } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch source texts
    const { data: sourceTexts } = await supabase
      .from('translations')
      .select('translation_key, translated_text')
      .eq('language_code', sourceLanguage)
      .in('translation_key', translationKeys);

    if (!sourceTexts || sourceTexts.length === 0) {
      throw new Error('No source texts found');
    }

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
      console.log(`Translating to ${targetLang}...`);

      const textsToTranslate = sourceTexts.map(t => ({
        key: t.translation_key,
        text: t.translated_text
      }));

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Translation error for ${targetLang}:`, errorText);
        continue;
      }

      const data = await response.json();
      const translatedContent = data.choices[0].message.content;
      
      // Parse AI response
      let translations;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = translatedContent.match(/```json\n([\s\S]*?)\n```/);
        translations = JSON.parse(jsonMatch ? jsonMatch[1] : translatedContent);
      } catch (e) {
        console.error(`Failed to parse translations for ${targetLang}:`, e);
        continue;
      }

      // Insert translations into database
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
        console.error(`Insert error for ${targetLang}:`, insertError);
        continue;
      }

      results.push({
        language: targetLang,
        count: translations.length,
        status: 'success'
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
