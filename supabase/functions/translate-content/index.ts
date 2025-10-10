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

    // Fetch ALL source texts to avoid URL length limits
    console.log(`Fetching all source texts for language: ${sourceLanguage}`);
    
    const { data: allSourceTexts, error: fetchError } = await supabase
      .from('translations')
      .select('translation_key, translated_text, page_location, context')
      .eq('language_code', sourceLanguage);

    if (fetchError) {
      console.error('Error fetching source texts:', fetchError);
      throw new Error(`Failed to fetch source texts: ${fetchError.message}`);
    }

    if (!allSourceTexts || allSourceTexts.length === 0) {
      console.error('No source texts found');
      throw new Error('No source texts found');
    }

    // Filter in memory to match requested keys
    const requestedKeysSet = new Set(translationKeys);
    const sourceTexts = allSourceTexts.filter(t => requestedKeysSet.has(t.translation_key));

    console.log(`Successfully fetched ${allSourceTexts.length} total texts, filtered to ${sourceTexts.length} requested keys`);

    // Helper function for Scandinavian-specific guidance
    const getScandinavianGuidance = (lang: string): string => {
      const guides: Record<string, string> = {
        'no': `Norwegian-specific rules:
- Use "du" form (informal) - Norwegian business culture is informal
- Preserve English tech terms: "booking", "dashboard", "whitelabel", "NPS"
- Use Norwegian compound words where natural: "kundeservice", "brukeropplevelse"
- Avoid Swedish/Danish spellings`,
        'sv': `Swedish-specific rules:
- Use "du" form (informal) - Swedish business culture is informal
- Preserve English tech terms: "booking", "dashboard", "whitelabel", "NPS"
- Use Swedish compound words: "kundservice", "användarupplevelse"
- Avoid Norwegian/Danish spellings`,
        'da': `Danish-specific rules:
- Use "du" form (informal) - Danish business culture is informal
- Preserve English tech terms: "booking", "dashboard", "whitelabel", "NPS"
- Use Danish spelling: "kundeservice", "brugeroplevelse"
- Avoid Norwegian/Swedish spellings`,
        'fi': `Finnish-specific rules:
- Use "sinä" form (informal "you")
- Preserve English tech terms: "booking", "dashboard", "whitelabel", "NPS"
- Use Finnish compound words: "asiakaspalvelu", "käyttäjäkokemus"
- Maintain case endings consistently`
      };
      return guides[lang] || '';
    };

    // Enhanced TOV guide with context awareness
    const tovGuide = `You are translating content for Noddi Tech, an automotive service technology platform.

TONE OF VOICE PRINCIPLES:
1. Intelligent Confidence - Expert but never condescending
2. Design-Led Simplicity - Clear, concise, jargon-free
3. Operational Directness - Action-focused, results-driven
4. Nordic Sass - Smart wit, never cute

TRANSLATION RULES:
- Use declarative statements (not questions)
- Keep sentences short and punchy
- Avoid corporate buzzwords
- Maintain professional tone while being human
- Preserve ALL technical terms in English (e.g., "booking", "NPS", "whitelabel", "dashboard")
- Preserve ALL HTML tags and placeholders exactly as they appear (e.g., <strong>, {variable}, %s)
- Maintain the same level of formality as the source

TECHNICAL GLOSSARY (PRESERVE IN ENGLISH):
- booking (reservation system)
- NPS (Net Promoter Score)
- whitelabel
- dashboard
- API
- CRM
- ROI

TEXT TYPE ADAPTATION:
- Headlines: Punchy, benefit-driven, max 60 chars
- Buttons: Action verbs, 2-4 words
- Descriptions: Clear benefits, 120-160 chars
- Feature text: Specific, measurable outcomes
- Error messages: Clear, solution-focused

When translating, adapt idioms and expressions naturally to the target language while preserving meaning and tone.`;

    const results = [];

    for (const targetLang of targetLanguages) {
      console.log(`\n=== Starting translation for: ${targetLang} ===`);

      const textsToTranslate = sourceTexts.map(t => ({
        key: t.translation_key,
        text: t.translated_text,
        page: t.page_location || 'general',
        context: t.context || ''
      }));

      console.log(`Calling Lovable AI API for ${targetLang} with ${textsToTranslate.length} texts`);

      const scandinavianGuide = getScandinavianGuidance(targetLang);
      const fullGuide = scandinavianGuide ? `${tovGuide}\n\n${scandinavianGuide}` : tovGuide;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: fullGuide },
            { 
              role: 'user', 
              content: `Translate the following texts to ${targetLang}. Consider the page location and context for each text. Return ONLY valid JSON with the same structure:\n\n${JSON.stringify(textsToTranslate, null, 2)}`
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
      
      // Parse AI translation response
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

      // QUALITY SCORING PASS - Evaluate each translation
      console.log(`Starting quality evaluation for ${targetLang}`);
      
      const qualityEvaluationPrompt = `Evaluate the quality of these translations from English to ${targetLang}. Score each translation 0-100% based on:

1. Semantic Accuracy (30%): Does it convey the exact meaning?
2. Tone & Voice Match (20%): Does it match Noddi Tech's tone (confident, clear, direct)?
3. Cultural Fit (15%): Is it natural for ${targetLang} speakers?
4. Technical Term Preservation (15%): Are English tech terms preserved correctly?
5. Grammar & Fluency (10%): Is it grammatically perfect and natural?
6. Length Appropriateness (10%): Similar length to source, fits UI context?

Return JSON array with format:
[{
  "key": "translation.key",
  "score": 85,
  "issues": ["Minor: Could be more concise"],
  "strengths": ["Perfect tone match", "Natural phrasing"]
}]

Translations to evaluate:
${JSON.stringify(translations.map((t: any) => ({
  key: t.key,
  original: sourceTexts.find(s => s.translation_key === t.key)?.translated_text,
  translation: t.text,
  page: t.page,
  context: t.context
})), null, 2)}`;

      const qualityResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a professional translation quality evaluator. Be critical but fair.' },
            { role: 'user', content: qualityEvaluationPrompt }
          ],
        }),
      });

      if (!qualityResponse.ok) {
        console.error(`Quality evaluation failed for ${targetLang}:`, qualityResponse.status);
        // Continue without quality scores
      }

      let qualityScores: any[] = [];
      if (qualityResponse.ok) {
        const qualityData = await qualityResponse.json();
        const qualityContent = qualityData.choices[0].message.content;
        
        try {
          const qualityJsonMatch = qualityContent.match(/```json\n([\s\S]*?)\n```/);
          const qualityJsonToParse = qualityJsonMatch ? qualityJsonMatch[1] : qualityContent;
          qualityScores = JSON.parse(qualityJsonToParse);
          console.log(`Successfully evaluated ${qualityScores.length} translations for ${targetLang}`);
        } catch (e) {
          console.error(`Failed to parse quality scores for ${targetLang}:`, e);
        }
      }

      // Insert translations into database with quality scores
      console.log(`Preparing to upsert ${translations.length} records for ${targetLang}`);
      
      const translationRecords = translations.map((t: any) => {
        const qualityData = qualityScores.find(q => q.key === t.key);
        const score = qualityData?.score || null;
        
        return {
          translation_key: t.key,
          language_code: targetLang,
          translated_text: t.text,
          page_location: t.key.split('.')[0],
          approved: false,
          quality_score: score,
          quality_metrics: qualityData ? {
            score: score,
            issues: qualityData.issues || [],
            strengths: qualityData.strengths || [],
            evaluated_at: new Date().toISOString()
          } : null,
          review_status: score >= 85 ? 'approved' : (score ? 'needs_review' : 'pending'),
          ai_reviewed_at: qualityData ? new Date().toISOString() : null
        };
      });

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
