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

  console.log('=== Quality Evaluation Function Started ===');

  try {
    const { translationKeys, targetLanguage, sourceLanguage = 'en' } = await req.json();
    
    console.log('Request payload:', {
      keysCount: translationKeys?.length,
      targetLanguage,
      sourceLanguage
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch source (English) texts
    console.log(`Fetching source texts for language: ${sourceLanguage}`);
    const { data: sourceTexts, error: sourceError } = await supabase
      .from('translations')
      .select('translation_key, translated_text, page_location, context')
      .eq('language_code', sourceLanguage)
      .in('translation_key', translationKeys);

    if (sourceError || !sourceTexts || sourceTexts.length === 0) {
      throw new Error(`Failed to fetch source texts: ${sourceError?.message || 'No data'}`);
    }

    // Fetch target translations
    console.log(`Fetching target translations for language: ${targetLanguage}`);
    const { data: targetTexts, error: targetError } = await supabase
      .from('translations')
      .select('translation_key, translated_text')
      .eq('language_code', targetLanguage)
      .in('translation_key', translationKeys);

    if (targetError || !targetTexts || targetTexts.length === 0) {
      throw new Error(`Failed to fetch target translations: ${targetError?.message || 'No data'}`);
    }

    console.log(`Processing ${targetTexts.length} translations in batches of 100`);

    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < targetTexts.length; i += BATCH_SIZE) {
      batches.push(targetTexts.slice(i, i + BATCH_SIZE));
    }

    let totalEvaluated = 0;
    let totalFailed = 0;
    let qualitySum = 0;
    let highQualityCount = 0;
    let mediumQualityCount = 0;
    let lowQualityCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\nEvaluating batch ${batchIndex + 1}/${batches.length} (${batch.length} translations)`);

      // Prepare translations for evaluation
      const translationsForEvaluation = batch.map(t => {
        const source = sourceTexts.find(s => s.translation_key === t.translation_key);
        return {
          key: t.translation_key,
          original: source?.translated_text || '',
          translation: t.translated_text
        };
      });

      const qualityEvaluationPrompt = `Evaluate these ${targetLanguage} translations and return a quality score (0-100%) for each. Return ONLY valid JSON array:
[{"key": "x", "score": 85, "issues": ["issue1"], "strengths": ["strength1"]}]

Evaluation Criteria:
- Semantic Accuracy (30%) - Does it convey the same meaning?
- Tone Match (20%) - Does it match the professional yet human tone?
- Cultural Fit (15%) - Is it appropriate for the target culture?
- Tech Terms Preserved (15%) - Are technical terms kept in English?
- Grammar (10%) - Is it grammatically correct?
- Length Appropriateness (10%) - Is the length reasonable?

Be critical but fair. Score 85+ for excellent, 70-84 for good, <70 needs improvement.

Translations to evaluate:
${JSON.stringify(translationsForEvaluation, null, 2)}`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a translation quality evaluator. Be critical but fair. Return ONLY valid JSON.' },
              { role: 'user', content: qualityEvaluationPrompt }
            ],
          }),
        });

        if (!response.ok) {
          console.error(`AI API error for batch ${batchIndex + 1}:`, response.status);
          totalFailed += batch.length;
          continue;
        }

        const data = await response.json();
        const qualityContent = data.choices[0].message.content;
        
        // Parse quality scores
        let qualityScores;
        try {
          const jsonMatch = qualityContent.match(/```json\n([\s\S]*?)\n```/);
          const jsonToParse = jsonMatch ? jsonMatch[1] : qualityContent;
          qualityScores = JSON.parse(jsonToParse);
          console.log(`Parsed ${qualityScores.length} quality evaluations for batch ${batchIndex + 1}`);
        } catch (e) {
          console.error(`Failed to parse quality scores for batch ${batchIndex + 1}:`, e);
          totalFailed += batch.length;
          continue;
        }

        // Update translations with quality data
        for (const quality of qualityScores) {
          const score = quality.score || 0;
          
          // Track statistics
          qualitySum += score;
          if (score >= 85) highQualityCount++;
          else if (score >= 70) mediumQualityCount++;
          else lowQualityCount++;

          const { error: updateError } = await supabase
            .from('translations')
            .update({
              quality_score: score,
              quality_metrics: {
                score: score,
                issues: quality.issues || [],
                strengths: quality.strengths || [],
                evaluated_at: new Date().toISOString()
              },
              review_status: score >= 85 ? 'approved' : (score >= 70 ? 'pending' : 'needs_review'),
              ai_reviewed_at: new Date().toISOString()
            })
            .eq('translation_key', quality.key)
            .eq('language_code', targetLanguage);

          if (updateError) {
            console.error(`Failed to update quality for ${quality.key}:`, updateError);
            totalFailed++;
          } else {
            totalEvaluated++;
          }
        }

        console.log(`✓ Batch ${batchIndex + 1} complete: ${qualityScores.length} evaluations saved`);

      } catch (error: any) {
        console.error(`Error evaluating batch ${batchIndex + 1}:`, error);
        totalFailed += batch.length;
      }
    }

    const averageScore = totalEvaluated > 0 ? Math.round(qualitySum / totalEvaluated) : 0;

    console.log(`\n✓ Quality evaluation complete for ${targetLanguage}`);
    console.log(`Evaluated: ${totalEvaluated}, Failed: ${totalFailed}, Avg Score: ${averageScore}%`);

    return new Response(JSON.stringify({ 
      language: targetLanguage,
      evaluatedCount: totalEvaluated,
      failedCount: totalFailed,
      averageScore,
      highQuality: highQualityCount,
      mediumQuality: mediumQualityCount,
      lowQuality: lowQualityCount,
      status: totalFailed > 0 ? 'partial' : 'success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== Quality Evaluation Error ===');
    console.error('Error:', error.message);
    
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
