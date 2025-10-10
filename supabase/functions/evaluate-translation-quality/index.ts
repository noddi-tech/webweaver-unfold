import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 20; // Reduced from 100 to avoid timeouts
const MAX_EXECUTION_TIME = 100000; // 100 seconds - leave buffer before 120s timeout
const STAGE2_SAMPLE_SIZE = 5; // Only validate top 5 uncertain terms per batch

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('=== Quality Evaluation Function Started ===');

  try {
    const { targetLanguage, sourceLanguage = 'en', startFromKey = null } = await req.json();
    
    console.log('Request payload:', {
      targetLanguage,
      sourceLanguage,
      startFromKey: startFromKey || 'beginning',
      batchSize: BATCH_SIZE
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Initialize or update progress tracking
    const { data: existingProgress } = await supabase
      .from('evaluation_progress')
      .select('*')
      .eq('language_code', targetLanguage)
      .single();

    // Fetch source (English) texts
    console.log(`Fetching source texts for language: ${sourceLanguage}`);
    const { data: sourceTexts, error: sourceError } = await supabase
      .from('translations')
      .select('translation_key, translated_text, page_location, context')
      .eq('language_code', sourceLanguage)
      .order('translation_key');

    if (sourceError || !sourceTexts || sourceTexts.length === 0) {
      throw new Error(`Failed to fetch source texts: ${sourceError?.message || 'No data'}`);
    }

    // Fetch target translations (with resume capability)
    console.log(`Fetching target translations for language: ${targetLanguage}`);
    let query = supabase
      .from('translations')
      .select('translation_key, translated_text')
      .eq('language_code', targetLanguage)
      .order('translation_key');

    // Resume from last key if provided
    if (startFromKey) {
      query = query.gt('translation_key', startFromKey);
      console.log(`Resuming from key: ${startFromKey}`);
    }

    const { data: targetTexts, error: targetError } = await query;

    if (targetError) {
      throw new Error(`Failed to fetch target translations: ${targetError?.message}`);
    }

    if (!targetTexts || targetTexts.length === 0) {
      console.log('No more translations to evaluate');
      
      // Mark as completed
      await supabase
        .from('evaluation_progress')
        .upsert({
          language_code: targetLanguage,
          total_keys: existingProgress?.total_keys || 0,
          evaluated_keys: existingProgress?.total_keys || 0,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      return new Response(JSON.stringify({ 
        language: targetLanguage,
        status: 'completed',
        message: 'All translations evaluated',
        shouldContinue: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize progress if this is the first run
    if (!startFromKey) {
      const totalCount = sourceTexts.length;
      await supabase
        .from('evaluation_progress')
        .upsert({
          language_code: targetLanguage,
          total_keys: totalCount,
          evaluated_keys: 0,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_evaluated_key: null
        });
      console.log(`Starting new evaluation: ${totalCount} total translations`);
    }

    console.log(`Processing ${targetTexts.length} translations in batches of ${BATCH_SIZE}`);

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
    let lastProcessedKey = startFromKey;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      // Check if we're approaching timeout
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > MAX_EXECUTION_TIME) {
        console.log(`⏱️ Approaching timeout at ${elapsedTime}ms - returning partial results`);
        
        const currentEvaluatedCount = (existingProgress?.evaluated_keys || 0) + totalEvaluated;
        
        // Update progress
        await supabase
          .from('evaluation_progress')
          .update({
            evaluated_keys: currentEvaluatedCount,
            last_evaluated_key: lastProcessedKey,
            updated_at: new Date().toISOString(),
            status: 'in_progress'
          })
          .eq('language_code', targetLanguage);

        return new Response(JSON.stringify({ 
          language: targetLanguage,
          evaluatedCount: totalEvaluated,
          failedCount: totalFailed,
          totalEvaluated: currentEvaluatedCount,
          totalKeys: existingProgress?.total_keys || sourceTexts.length,
          lastKey: lastProcessedKey,
          shouldContinue: true,
          status: 'partial',
          message: `Processed ${totalEvaluated} translations in this batch. ${sourceTexts.length - currentEvaluatedCount} remaining.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const batch = batches[batchIndex];
      const batchStartTime = Date.now();
      console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length} (${batch.length} translations) - Elapsed: ${Math.round((Date.now() - startTime) / 1000)}s`);

      // Prepare translations for evaluation
      const translationsForEvaluation = batch.map(t => {
        const source = sourceTexts.find(s => s.translation_key === t.translation_key);
        return {
          key: t.translation_key,
          original: source?.translated_text || '',
          translation: t.translated_text
        };
      });

      // STAGE 1: Fast technical term detection with Gemini
      const stage1TermPrompt = `Analyze these ${targetLanguage} translations and identify technical terms that were incorrectly translated.

**CRITICAL TECHNICAL TERMS TO CHECK (MUST be in English):**
API, Backend, Frontend, Database, Cloud, DevOps, SaaS, SDK, JSON, HTTP, REST, GraphQL, OAuth, JWT, Git, GitHub, Noddi, booking, whitelabel, NPS, CRM, ERP, Dashboard, Analytics, Metrics, KPI, ROI, Button, Toggle, Modal, Dialog, Tooltip, Sidebar, Header, Footer, Login, Logout, Download, Upload, Sync, Deploy, Onboarding

**YOUR TASK:**
1. Compare each translation against the original English text
2. Identify ANY technical terms that were translated instead of kept in English
3. For each issue, provide:
   - key: translation_key
   - term_original: the English technical term
   - term_translated: the incorrectly translated version
   - confidence: "high" (obvious error), "medium" (likely error), or "low" (uncertain)
   - suggestion: what it should be
   - context: brief explanation

**Return ONLY valid JSON array:**
[{
  "key": "translation_key",
  "term_original": "Backend",
  "term_translated": "Bakende", 
  "confidence": "high",
  "suggestion": "Keep as 'Backend'",
  "context": "Technical infrastructure term"
}]

If no issues found, return: []

Translations to check:
${JSON.stringify(translationsForEvaluation, null, 2)}`;

      console.log(`🔍 Stage 1: Running fast technical term scan with Gemini...`);

      let technicalIssues = [];
      try {
        const stage1Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: 'You are a technical term validator. Be strict about technical terms. Return ONLY valid JSON array.' 
              },
              { role: 'user', content: stage1TermPrompt }
            ],
          }),
        });

        if (stage1Response.ok) {
          const stage1Data = await stage1Response.json();
          const stage1Content = stage1Data.choices[0].message.content;
          try {
            const jsonMatch = stage1Content.match(/```json\n([\s\S]*?)\n```/);
            const jsonToParse = jsonMatch ? jsonMatch[1] : stage1Content;
            technicalIssues = JSON.parse(jsonToParse);
            console.log(`✓ Stage 1: Found ${technicalIssues.length} potential technical term issues`);
          } catch (e) {
            console.error('⚠️ Stage 1: Failed to parse technical term validation:', e);
          }
        } else {
          console.error(`⚠️ Stage 1: AI API error:`, stage1Response.status);
        }
      } catch (e) {
        console.error('⚠️ Stage 1: Technical term scan failed:', e);
      }

      // STAGE 2: Deep reasoning for HIGH CONFIDENCE uncertain cases (optimized)
      const uncertainIssues = technicalIssues
        .filter(issue => issue.confidence === 'medium' || issue.confidence === 'low')
        .slice(0, STAGE2_SAMPLE_SIZE); // Only validate top 5

      if (uncertainIssues.length > 0) {
        console.log(`🧠 Stage 2: Validating top ${uncertainIssues.length} uncertain terms with GPT-5-mini...`);
        
        for (const uncertainIssue of uncertainIssues) {
          const stage2Prompt = `You are a technical translation expert. Analyze this term carefully:

**Original English term:** "${uncertainIssue.term_original}"
**Translated as:** "${uncertainIssue.term_translated}" (in ${targetLanguage})
**Context:** ${uncertainIssue.context}

**Question:** Should "${uncertainIssue.term_original}" be kept in English or translated to ${targetLanguage}?

Consider:
1. Is this a widely-recognized technical term in the software/business industry?
2. What is the standard practice in ${targetLanguage}-speaking countries?
3. Would translating it cause confusion or reduce clarity?
4. Is this a product name, brand, or proprietary term?

Return ONLY valid JSON:
{
  "should_keep_english": true/false,
  "confidence": "high"/"medium"/"low",
  "reasoning": "Brief explanation"
}`;

          try {
            const stage2Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'openai/gpt-5-mini',
                messages: [
                  { 
                    role: 'system', 
                    content: 'You are a technical translation expert. Return ONLY valid JSON.' 
                  },
                  { role: 'user', content: stage2Prompt }
                ],
              }),
            });
            
            if (stage2Response.ok) {
              const stage2Data = await stage2Response.json();
              const stage2Content = stage2Data.choices[0].message.content;
              
              try {
                const jsonMatch = stage2Content.match(/```json\n([\s\S]*?)\n```/);
                const jsonToParse = jsonMatch ? jsonMatch[1] : stage2Content;
                const validation = JSON.parse(jsonToParse);
                
                uncertainIssue.deep_reasoning = validation.reasoning;
                
                if (validation.should_keep_english && validation.confidence === 'high') {
                  uncertainIssue.confidence = 'high';
                  uncertainIssue.validated_by_stage2 = true;
                } else if (!validation.should_keep_english) {
                  uncertainIssue.false_positive = true;
                }
                
                console.log(`  ✓ "${uncertainIssue.term_original}" - should_keep_english: ${validation.should_keep_english}`);
                
              } catch (e) {
                console.error(`  ⚠️ Failed to parse validation for "${uncertainIssue.term_original}":`, e);
              }
            }
            
          } catch (e) {
            console.error(`  ⚠️ Validation failed for "${uncertainIssue.term_original}":`, e);
          }
        }
        
        technicalIssues = technicalIssues.filter(issue => !issue.false_positive);
        console.log(`✓ Stage 2 complete: ${technicalIssues.length} confirmed issues`);
      }

      // QUALITY EVALUATION
      const qualityEvaluationPrompt = `Evaluate these ${targetLanguage} translations and return a quality score (0-100%) for each. Return ONLY valid JSON array:
[{"key": "x", "score": 85, "issues": ["issue1"], "strengths": ["strength1"]}]

Evaluation Criteria:
- Semantic Accuracy (30%) - Does it convey the same meaning?
- Tech Terms Preserved (25%) - Technical terms MUST be in English
- Tone Match (20%) - Professional yet human tone?
- Cultural Fit (15%) - Appropriate for target culture?
- Grammar & Length (10%) - Correct and appropriate?

Score 85+ for excellent, 70-84 for good, <70 needs improvement.

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
          console.error(`⚠️ AI API error for batch:`, response.status);
          totalFailed += batch.length;
          continue;
        }

        const data = await response.json();
        const qualityContent = data.choices[0].message.content;
        
        let qualityScores;
        try {
          const jsonMatch = qualityContent.match(/```json\n([\s\S]*?)\n```/);
          const jsonToParse = jsonMatch ? jsonMatch[1] : qualityContent;
          qualityScores = JSON.parse(jsonToParse);
          console.log(`✓ Parsed ${qualityScores.length} quality evaluations`);
        } catch (e) {
          console.error(`⚠️ Failed to parse quality scores:`, e);
          totalFailed += batch.length;
          continue;
        }

        // Batch update translations (much faster than individual updates)
        const updates = qualityScores.map(quality => {
          const score = quality.score || 0;
          
          qualitySum += score;
          if (score >= 85) highQualityCount++;
          else if (score >= 70) mediumQualityCount++;
          else lowQualityCount++;

          // Find the original translation text from the batch to preserve it
          const batchItem = batch.find(b => b.translation_key === quality.key);

          return {
            translation_key: quality.key,
            language_code: targetLanguage,
            translated_text: batchItem?.translated_text || '',
            quality_score: score,
            quality_metrics: {
              score: score,
              issues: quality.issues || [],
              strengths: quality.strengths || [],
              technical_term_issues: technicalIssues.filter(t => t.key === quality.key),
              evaluated_at: new Date().toISOString()
            },
            review_status: score >= 85 ? 'approved' : (score >= 70 ? 'pending' : 'needs_review'),
            ai_reviewed_at: new Date().toISOString()
          };
        });

        // Batch upsert
        const { error: updateError } = await supabase
          .from('translations')
          .upsert(updates, {
            onConflict: 'translation_key,language_code'
          });

        if (updateError) {
          console.error(`⚠️ Batch update error:`, updateError);
          totalFailed += batch.length;
        } else {
          totalEvaluated += qualityScores.length;
          lastProcessedKey = batch[batch.length - 1].translation_key;
          
          // Update progress after each batch
          const currentEvaluatedCount = (existingProgress?.evaluated_keys || 0) + totalEvaluated;
          await supabase
            .from('evaluation_progress')
            .update({
              evaluated_keys: currentEvaluatedCount,
              last_evaluated_key: lastProcessedKey,
              updated_at: new Date().toISOString()
            })
            .eq('language_code', targetLanguage);
        }

        const batchTime = Math.round((Date.now() - batchStartTime) / 1000);
        console.log(`✅ Batch ${batchIndex + 1} complete in ${batchTime}s: ${qualityScores.length} evaluations saved`);

      } catch (error: any) {
        console.error(`⚠️ Error evaluating batch ${batchIndex + 1}:`, error);
        totalFailed += batch.length;
      }
    }

    // Check if all translations evaluated
    const currentTotalEvaluated = (existingProgress?.evaluated_keys || 0) + totalEvaluated;
    const totalKeys = existingProgress?.total_keys || sourceTexts.length;
    const isComplete = currentTotalEvaluated >= totalKeys;

    if (isComplete) {
      await supabase
        .from('evaluation_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          evaluated_keys: totalKeys,
          updated_at: new Date().toISOString()
        })
        .eq('language_code', targetLanguage);
    }

    const averageScore = totalEvaluated > 0 ? Math.round(qualitySum / totalEvaluated) : 0;
    const totalTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n✅ Evaluation ${isComplete ? 'complete' : 'partial'} for ${targetLanguage}`);
    console.log(`Evaluated: ${totalEvaluated}, Failed: ${totalFailed}, Avg Score: ${averageScore}%, Time: ${totalTime}s`);

    return new Response(JSON.stringify({ 
      language: targetLanguage,
      evaluatedCount: totalEvaluated,
      failedCount: totalFailed,
      averageScore,
      highQuality: highQualityCount,
      mediumQuality: mediumQualityCount,
      lowQuality: lowQualityCount,
      totalEvaluated: currentTotalEvaluated,
      totalKeys,
      lastKey: lastProcessedKey,
      shouldContinue: !isComplete,
      status: isComplete ? 'success' : 'partial',
      executionTime: totalTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== Quality Evaluation Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack?.substring(0, 500));
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack?.substring(0, 200),
        status: 'error'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
