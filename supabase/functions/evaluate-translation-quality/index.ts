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
    const { targetLanguage, sourceLanguage = 'en' } = await req.json();
    
    console.log('Request payload:', {
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
      .eq('language_code', sourceLanguage);

    if (sourceError || !sourceTexts || sourceTexts.length === 0) {
      throw new Error(`Failed to fetch source texts: ${sourceError?.message || 'No data'}`);
    }

    // Fetch target translations
    console.log(`Fetching target translations for language: ${targetLanguage}`);
    const { data: targetTexts, error: targetError } = await supabase
      .from('translations')
      .select('translation_key, translated_text')
      .eq('language_code', targetLanguage);

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

      console.log(`Stage 1: Running fast technical term scan with Gemini...`);

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
            console.log(`Stage 1: Found ${technicalIssues.length} potential technical term issues in batch ${batchIndex + 1}`);
          } catch (e) {
            console.error('Stage 1: Failed to parse technical term validation:', e);
          }
        } else {
          console.error(`Stage 1: AI API error:`, stage1Response.status);
        }
      } catch (e) {
        console.error('Stage 1: Technical term scan failed:', e);
      }

      // STAGE 2: Deep reasoning for uncertain cases
      const uncertainIssues = technicalIssues.filter(issue => 
        issue.confidence === 'low' || issue.confidence === 'medium'
      );

      if (uncertainIssues.length > 0) {
        console.log(`Stage 2: Validating ${uncertainIssues.length} uncertain terms with GPT-5-mini...`);
        
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
  "reasoning": "Brief explanation",
  "industry_standard": "What professionals typically do"
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
                    content: 'You are a technical translation expert. Provide authoritative answers about industry standard terminology usage. Return ONLY valid JSON.' 
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
                
                // Add deep reasoning to the issue
                uncertainIssue.deep_reasoning = validation.reasoning;
                uncertainIssue.industry_standard = validation.industry_standard;
                
                // Update confidence based on Stage 2 validation
                if (validation.should_keep_english && validation.confidence === 'high') {
                  uncertainIssue.confidence = 'high';
                  uncertainIssue.validated_by_stage2 = true;
                } else if (!validation.should_keep_english) {
                  uncertainIssue.false_positive = true;
                }
                
                console.log(`Stage 2: Validated "${uncertainIssue.term_original}" - should_keep_english: ${validation.should_keep_english}`);
                
              } catch (e) {
                console.error(`Stage 2: Failed to parse validation for "${uncertainIssue.term_original}":`, e);
              }
            } else {
              console.error(`Stage 2: AI API error for "${uncertainIssue.term_original}":`, stage2Response.status);
            }
            
          } catch (e) {
            console.error(`Stage 2: Validation failed for "${uncertainIssue.term_original}":`, e);
          }
        }
        
        // Remove false positives
        technicalIssues = technicalIssues.filter(issue => !issue.false_positive);
        console.log(`Stage 2 complete: ${technicalIssues.length} confirmed technical term issues`);
      }

      const qualityEvaluationPrompt = `Evaluate these ${targetLanguage} translations and return a quality score (0-100%) for each. Return ONLY valid JSON array:
[{"key": "x", "score": 85, "issues": ["issue1"], "strengths": ["strength1"]}]

Evaluation Criteria:
- Semantic Accuracy (30%) - Does it convey the same meaning?
- Tech Terms Preserved (25%) - **CRITICAL** Technical terms MUST be in English (API, Backend, Frontend, Dashboard, booking, NPS, etc.). Deduct heavily if translated.
- Tone Match (20%) - Does it match the professional yet human tone?
- Cultural Fit (15%) - Is it appropriate for the target culture?
- Grammar & Length (10%) - Is it grammatically correct and appropriate length?

**Tech Terms Check:** Look for these terms translated incorrectly:
- API → エーピーアイ (wrong), Schnittstelle (wrong), APIen (wrong)
- Backend → バックエンド (wrong), Bakende (wrong), Backende (wrong)
- Dashboard → Dashbord (wrong), ダッシュボード (wrong)
- booking → bestilling (wrong), Buchung (wrong), réservation (wrong)

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
                technical_term_issues: technicalIssues.filter(t => t.key === quality.key),
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
