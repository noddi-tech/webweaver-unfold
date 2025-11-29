import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateSingleKeyRequest {
  translationKey: string;
  targetLanguage: string;
  context?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { translationKey, targetLanguage, context }: TranslateSingleKeyRequest = await req.json();

    if (!translationKey || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'translationKey and targetLanguage are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch English source text
    const { data: englishTranslation, error: fetchError } = await supabase
      .from('translations')
      .select('translated_text, context')
      .eq('translation_key', translationKey)
      .eq('language_code', 'en')
      .single();

    if (fetchError || !englishTranslation) {
      console.error('Error fetching English text:', fetchError);
      return new Response(
        JSON.stringify({ error: 'English source text not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const englishText = englishTranslation.translated_text;
    const translationContext = context || englishTranslation.context || '';

    console.log(`Translating key: ${translationKey} to ${targetLanguage}`);

    // Get target language name
    const { data: languageData } = await supabase
      .from('languages')
      .select('name, native_name')
      .eq('code', targetLanguage)
      .single();

    const languageName = languageData?.name || targetLanguage;

    // Fetch brand TOV
    const { data: tovDoc } = await supabase
      .from('static_files')
      .select('content')
      .eq('file_path', 'content/brand/tov-noddi-tech.md')
      .single();

    const brandTOV = tovDoc?.content || '';

    // Technical terms to preserve
    const technicalTerms = ['Noddi', 'Navio', 'API', 'CRM', 'ERP', 'ROI', 'NPS', 'SaaS'];

    // Construct AI translation prompt
    const systemPrompt = `You are a professional translator specializing in software localization and marketing content.

**CRITICAL INSTRUCTIONS:**

1. **PRESERVE TECHNICAL TERMS:** Never translate: ${technicalTerms.join(', ')}
2. **BRAND TONE OF VOICE:** ${brandTOV}
3. **TARGET AUDIENCE:** B2B SaaS professionals in ${languageName}

**PHRASE-LEVEL ADAPTATION (NOT WORD-FOR-WORD):**

In Germanic languages (German, Norwegian, Swedish, Danish, Dutch), multi-word English phrases 
often become SINGLE compound words. NEVER translate word-by-word.

EXAMPLES:
✅ CORRECT: "Operations platform" → Norwegian: "driftsplattform" (NOT "operasjoner plattform")
✅ CORRECT: "Service scheduling" → German: "Serviceterminierung" (NOT "Service Planung")
✅ CORRECT: "Customer portal" → Swedish: "kundportalen" (NOT "kund portal")
✅ CORRECT: "Booking system" → Norwegian: "bookingsystem" (NOT "booking system")
✅ CORRECT: "User experience" → German: "Benutzererfahrung" (NOT "Benutzer Erfahrung")

For Romance languages (French, Spanish, Italian, Portuguese):
- Adapt sentence structure to target language norms
- "Get started" → French: "Commencer" (NOT "Obtenir commencé")
- "Sign up for free" → Spanish: "Regístrate gratis" (NOT "Inscribirse para gratis")

For Scandinavian languages:
- Use compound words naturally (e.g., "driftsplattform" not "drifts plattform")
- Match local business terminology conventions
- Adapt to Norwegian Bokmål style (not Nynorsk)

**CONTEXT:**
Translation key: ${translationKey}
Additional context: ${translationContext || 'None provided'}

**OUTPUT FORMAT:**
Return ONLY the translated text. No explanations. No quotes. Just the translation.`;

    const userPrompt = `Translate this text to ${languageName}:\n\n"${englishText}"`;

    // Call Lovable AI for translation
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI translation error:', errorText);
      throw new Error(`AI translation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const translatedText = aiData.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation returned from AI');
    }

    console.log(`Translation complete: ${englishText} → ${translatedText}`);

    // Save translation to database
    const { error: upsertError } = await supabase
      .from('translations')
      .upsert({
        translation_key: translationKey,
        language_code: targetLanguage,
        translated_text: translatedText,
        approved: false,
        is_stale: false,
        review_status: 'pending',
        context: translationContext,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'translation_key,language_code'
      });

    if (upsertError) {
      console.error('Error saving translation:', upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        translationKey,
        targetLanguage,
        englishText,
        translatedText,
        message: `Translation saved for ${translationKey} → ${targetLanguage}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-single-key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
