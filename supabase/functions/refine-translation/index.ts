import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const RefineTranslationSchema = z.object({
  englishText: z.string().min(1).max(10000),
  currentTranslation: z.string().min(1).max(10000),
  targetLanguage: z.string().min(2).max(10),
  targetLanguageName: z.string().min(1).max(100),
  context: z.string().max(500).optional(),
  pageLocation: z.string().max(200).optional(),
  tovContent: z.string().max(10000).optional()
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = RefineTranslationSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: validation.error.format() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { 
      englishText, 
      currentTranslation, 
      targetLanguage, 
      targetLanguageName,
      context, 
      pageLocation,
      tovContent 
    } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a professional translator specializing in natural, context-aware translations that respect brand tone of voice.

BRAND TONE OF VOICE:
${tovContent}

Your task: Refine the translation to sound natural and respect the brand voice while preserving meaning.
Consider:
- Cultural nuances and idiomatic expressions
- Natural sentence structure in target language
- Brand voice (confident, clear, human)
- Context of use (${pageLocation || 'general'} - ${context || 'general context'})

Respond ONLY with the refined translation text, no explanations.`;

    const userPrompt = `English source: "${englishText}"
Current ${targetLanguageName} translation: "${currentTranslation}"
Target language: ${targetLanguageName} (${targetLanguage})

Provide a natural, brand-appropriate translation.`;

    console.log('Refining translation for:', targetLanguage);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const refinedText = data.choices[0].message.content.trim();

    console.log('Refinement complete:', refinedText);

    return new Response(JSON.stringify({ refinedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Refine translation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
