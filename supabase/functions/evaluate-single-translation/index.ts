import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const EvaluateSingleSchema = z.object({
  translationKey: z.string().min(1).max(500),
  languageCode: z.string().min(2).max(10),
  originalText: z.string().min(1).max(10000),
  translatedText: z.string().min(1).max(10000)
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
    const validation = EvaluateSingleSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: validation.error.format() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { translationKey, languageCode, originalText, translatedText } = validation.data;

    console.log(`Evaluating single translation: ${translationKey} (${languageCode})`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client for database updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Stage 1: Quick evaluation with Gemini-flash
    const systemPrompt = `You are a translation quality evaluator. Evaluate this translation and return a JSON object with:
- qualityScore (0-100): Overall quality score
- accuracy (0-100): How accurate is the translation
- fluency (0-100): How natural/fluent is the text
- consistency (0-100): Terminology and style consistency
- issues (array): List of specific issues found (empty if none)

Be strict but fair. Technical accuracy is critical.`;

    const userPrompt = `Original (English): "${originalText}"
Translated (${languageCode}): "${translatedText}"
Translation Key: "${translationKey}"

Evaluate this translation and return ONLY a JSON object.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse evaluation response');
    }

    const qualityScore = Math.round(evaluation.qualityScore || 0);
    const qualityMetrics = {
      accuracy: evaluation.accuracy || 0,
      fluency: evaluation.fluency || 0,
      consistency: evaluation.consistency || 0,
      issues: evaluation.issues || []
    };

    console.log(`Quality score: ${qualityScore}%, updating database...`);

    // Update the translation in the database
    const { error: updateError } = await supabase
      .from('translations')
      .update({
        quality_score: qualityScore,
        quality_metrics: qualityMetrics,
        ai_reviewed_at: new Date().toISOString()
      })
      .eq('translation_key', translationKey)
      .eq('language_code', languageCode);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Successfully evaluated translation: ${qualityScore}%`);

    return new Response(
      JSON.stringify({ 
        qualityScore, 
        qualityMetrics,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in evaluate-single-translation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
