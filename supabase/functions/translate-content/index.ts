import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const TranslateRequestSchema = z.object({
  translationKeys: z.array(z.string().min(1).max(500)).min(1).max(2000),
  targetLanguage: z.string().min(2).max(10).regex(/^[a-z]{2}(-[A-Z]{2})?$/),
  sourceLanguage: z.string().min(2).max(10).regex(/^[a-z]{2}(-[A-Z]{2})?$/).optional()
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Translation Function Started ===');

  try {
    const body = await req.json();
    
    // Validate input
    const validation = TranslateRequestSchema.safeParse(body);
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

    const { translationKeys, targetLanguage, sourceLanguage = 'en' } = validation.data;
    
    console.log('Request payload:', {
      keysCount: translationKeys.length,
      targetLanguage,
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

    // Enhanced TOV guide with phrase-level transformation examples
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
- Preserve ALL HTML tags and placeholders exactly as they appear (e.g., <strong>, {variable}, %s)
- Maintain the same level of formality as the source

**🚨 CRITICAL: PHRASE-LEVEL ADAPTATION (NOT WORD-FOR-WORD) 🚨**

In Germanic languages (German, Norwegian, Swedish, Danish, Dutch), multi-word English phrases 
often become SINGLE compound words. NEVER translate word-by-word.

**EXAMPLES - Germanic Languages:**
✅ CORRECT: "Operations platform" → Norwegian: "driftsplattform" (NOT "operasjoner plattform")
✅ CORRECT: "Service scheduling" → German: "Serviceterminierung" (NOT "Service Planung")
✅ CORRECT: "Customer portal" → Swedish: "kundportalen" (NOT "kund portal")
✅ CORRECT: "Booking system" → Norwegian: "bookingsystem" (NOT "booking system" - keep as compound)
✅ CORRECT: "User experience" → German: "Benutzererfahrung" (NOT "Benutzer Erfahrung")
✅ CORRECT: "Mobile services" → Norwegian: "mobile tjenester" (compound when natural)
✅ CORRECT: "Capacity management" → Danish: "kapacitetsstyring" (NOT "kapacitet styring")

**EXAMPLES - Romance Languages (French, Spanish, Italian, Portuguese):**
✅ CORRECT: "Get started" → French: "Commencer" (NOT "Obtenir commencé")
✅ CORRECT: "Sign up for free" → Spanish: "Regístrate gratis" (NOT "Inscribirse para gratis")
✅ CORRECT: "Learn more" → French: "En savoir plus" (NOT "Apprendre plus")
✅ CORRECT: "Book now" → Italian: "Prenota ora" (NOT "Libro ora")

**RULE:** Translate for MEANING and NATURAL FLOW in the target language, not for word-for-word equivalence.

**🚨 CRITICAL: TECHNICAL TERMS POLICY 🚨**

The following terms MUST ALWAYS remain in ENGLISH (never translate):

**Programming/Technology:**
API, Backend, Frontend, Database, Cloud, DevOps, SaaS, PaaS, SDK, JSON, XML, HTTP, HTTPS, REST, GraphQL, WebSocket, OAuth, JWT, CI/CD, Git, GitHub

**Business/Product:**
Noddi, booking, whitelabel, NPS (Net Promoter Score), CRM, ERP, Dashboard, Analytics, Metrics, KPI, ROI, B2B, B2C, SLA, MVP

**UI/UX Components:**
Button, Toggle, Switch, Dropdown, Select, Modal, Dialog, Tooltip, Popover, Sidebar, Header, Footer, Navigation, Breadcrumb, Tab, Accordion, Carousel

**Actions (keep in English):**
Login, Logout, Sign up, Sign in, Sign out, Download, Upload, Export, Import, Sync, Deploy, Onboarding

**CRITICAL EXAMPLES:**

✅ CORRECT Norwegian: "Integrer med din Backend via vårt API"
❌ WRONG Norwegian: "Integrer med din Bakende via vårt APIen"

✅ CORRECT Norwegian: "Dashboard for booking-statistikk"
❌ WRONG Norwegian: "Dashbord for bestilling-statistikk"

✅ CORRECT German: "Nutzen Sie unser API für Backend-Integration"
❌ WRONG German: "Nutzen Sie unsere Schnittstelle für Backend-Integration"

✅ CORRECT Japanese: "API経由でBackendに接続"
❌ WRONG Japanese: "エーピーアイ経由でバックエンドに接続"

**RULE:** If you see a technical term from the lists above, copy it EXACTLY as written in the source English text. Do NOT translate, transliterate, or adapt it in any way.

TEXT TYPE ADAPTATION:
- Headlines: Punchy, benefit-driven, max 60 chars
- Buttons: Action verbs, 2-4 words
- Descriptions: Clear benefits, 120-160 chars
- Feature text: Specific, measurable outcomes
- Error messages: Clear, solution-focused

When translating, adapt idioms and expressions naturally to the target language while preserving meaning and tone.`;

    const BATCH_SIZE = 100;

    // Helper function to validate translations
    const validateTranslation = (original: any, translated: any): boolean => {
      // Check if translation text is empty
      if (!translated.text || translated.text.trim() === '') {
        return false;
      }
      // Check if translation is the same as the key (AI failed to translate)
      if (translated.text === translated.key) {
        return false;
      }
      return true;
    };

    console.log(`\n=== Starting translation for: ${targetLanguage} ===`);

    const allTextsToTranslate = sourceTexts.map(t => ({
      key: t.translation_key,
      text: t.translated_text,
      page: t.page_location || 'general',
      context: t.context || ''
    }));

    // Split into batches
    const batches = [];
    for (let i = 0; i < allTextsToTranslate.length; i += BATCH_SIZE) {
      batches.push(allTextsToTranslate.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches for ${targetLanguage}`);

    let totalTranslated = 0;
    let totalFailed = 0;
    const failedBatches: number[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const textsToTranslate = batches[batchIndex];
      console.log(`\nBatch ${batchIndex + 1}/${batches.length} for ${targetLanguage} (${textsToTranslate.length} texts)`);

      const scandinavianGuide = getScandinavianGuidance(targetLanguage);
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
                content: `Translate the following texts to ${targetLanguage}. Return ONLY valid JSON with the same structure. Each "text" field must contain the actual translation in ${targetLanguage}, NOT the English key:\n\n${JSON.stringify(textsToTranslate, null, 2)}`
              }
            ],
          }),
        });

      console.log(`AI API response status for batch ${batchIndex + 1}:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for batch ${batchIndex + 1}:`, errorText);
        failedBatches.push(batchIndex + 1);
        totalFailed += textsToTranslate.length;
        
        if (response.status === 429) {
          console.log('Rate limit hit, waiting 2 seconds before continuing...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        continue;
      }

      const data = await response.json();
      const translatedContent = data.choices[0].message.content;
      
      // Parse AI translation response
      let translations;
      try {
        const jsonMatch = translatedContent.match(/```json\n([\s\S]*?)\n```/);
        const jsonToParse = jsonMatch ? jsonMatch[1] : translatedContent;
        translations = JSON.parse(jsonToParse);
        console.log(`Parsed ${translations.length} translations for batch ${batchIndex + 1}`);
      } catch (e) {
        console.error(`Failed to parse batch ${batchIndex + 1}:`, e);
        failedBatches.push(batchIndex + 1);
        totalFailed += textsToTranslate.length;
        continue;
      }

      // Validate translations
      const validTranslations = translations.filter((t: any) => {
        const sourceText = textsToTranslate.find(s => s.key === t.key);
        const isValid = validateTranslation(sourceText, t);
        if (!isValid) {
          console.warn(`Invalid translation for ${t.key}: text="${t.text}"`);
        }
        return isValid;
      });

      if (validTranslations.length === 0) {
        console.error(`All translations invalid in batch ${batchIndex + 1}`);
        failedBatches.push(batchIndex + 1);
        totalFailed += textsToTranslate.length;
        continue;
      }

      if (validTranslations.length < translations.length) {
        console.warn(`Only ${validTranslations.length}/${translations.length} translations valid in batch ${batchIndex + 1}`);
      }


      // Insert valid translations (without quality scoring)
      const translationRecords = validTranslations.map((t: any) => ({
        translation_key: t.key,
        language_code: targetLanguage,
        translated_text: t.text,
        page_location: t.key.split('.')[0],
        context: t.context || null,
        approved: false
      }));

      const { error: insertError } = await supabase
        .from('translations')
        .upsert(translationRecords, {
          onConflict: 'translation_key,language_code'
        });

      if (insertError) {
        console.error(`Database error for batch ${batchIndex + 1}:`, insertError);
        failedBatches.push(batchIndex + 1);
        totalFailed += validTranslations.length;
        continue;
      }

      totalTranslated += validTranslations.length;
      console.log(`✓ Batch ${batchIndex + 1} complete: ${validTranslations.length} translations saved`);
    }

    console.log(`\n✓ ${targetLanguage} complete: ${totalTranslated} translated, ${totalFailed} failed`);

    return new Response(JSON.stringify({ 
      language: targetLanguage,
      count: totalTranslated,
      failed: totalFailed,
      failedBatches: failedBatches,
      status: failedBatches.length > 0 ? 'partial' : 'success'
    }), {
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
