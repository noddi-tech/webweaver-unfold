import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncTranslateRequest {
  action: 'sync' | 'translate' | 'evaluate' | 'approve' | 'full-pipeline';
  languageCodes?: string[];
  options?: {
    batchSize?: number;
    autoApproveThreshold?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Sync & Translate Orchestrator ===');

  try {
    const body: SyncTranslateRequest = await req.json();
    const { action, languageCodes, options = {} } = body;

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: any = {
      action,
      steps: [],
      success: true,
    };

    // Get enabled languages if not specified
    let targetLanguages = languageCodes;
    if (!targetLanguages || targetLanguages.length === 0) {
      const { data: languages } = await supabase
        .from('languages')
        .select('code')
        .eq('enabled', true)
        .neq('code', 'en');
      targetLanguages = languages?.map(l => l.code) || [];
    }

    console.log(`Processing ${targetLanguages.length} languages:`, targetLanguages);

    // STEP 1: Sync missing translation keys
    if (action === 'sync' || action === 'full-pipeline') {
      console.log('Step 1: Syncing translation keys...');
      
      const { data: englishKeys } = await supabase
        .from('translations')
        .select('translation_key, page_location, context')
        .eq('language_code', 'en');

      let totalSynced = 0;

      for (const langCode of targetLanguages) {
        const { data: existingKeys } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', langCode);

        const existingKeySet = new Set(existingKeys?.map(k => k.translation_key) || []);
        const missingKeys = englishKeys?.filter(k => !existingKeySet.has(k.translation_key)) || [];

        if (missingKeys.length > 0) {
          const newEntries = missingKeys.map(k => ({
            translation_key: k.translation_key,
            language_code: langCode,
            translated_text: '',
            page_location: k.page_location,
            context: k.context,
            is_stale: true,
            review_status: 'needs_translation',
          }));

          const { error } = await supabase
            .from('translations')
            .upsert(newEntries, { onConflict: 'translation_key,language_code' });

          if (!error) {
            totalSynced += missingKeys.length;
          }
        }
      }

      results.steps.push({
        name: 'sync',
        success: true,
        synced: totalSynced,
        languages: targetLanguages.length,
      });
      console.log(`✓ Synced ${totalSynced} keys`);
    }

    // STEP 2: Translate missing content
    if (action === 'translate' || action === 'full-pipeline') {
      console.log('Step 2: Translating missing content...');
      
      let totalTranslated = 0;
      let failedLanguages: string[] = [];

      for (const langCode of targetLanguages) {
        // Get empty translations for this language
        const { data: emptyTranslations } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', langCode)
          .or('translated_text.is.null,translated_text.eq.');

        const keys = emptyTranslations?.map(t => t.translation_key) || [];

        if (keys.length > 0) {
          console.log(`Translating ${keys.length} keys for ${langCode}...`);
          
          // Call the translate-content function
          const translateResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/translate-content`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                translationKeys: keys,
                targetLanguage: langCode,
                sourceLanguage: 'en',
              }),
            }
          );

          if (translateResponse.ok) {
            const translateResult = await translateResponse.json();
            totalTranslated += translateResult.translated || 0;
          } else {
            failedLanguages.push(langCode);
          }
        }
      }

      results.steps.push({
        name: 'translate',
        success: failedLanguages.length === 0,
        translated: totalTranslated,
        failed: failedLanguages,
      });
      console.log(`✓ Translated ${totalTranslated} entries`);
    }

    // STEP 3: Evaluate quality
    if (action === 'evaluate' || action === 'full-pipeline') {
      console.log('Step 3: Evaluating translation quality...');
      
      let totalEvaluated = 0;
      let failedLanguages: string[] = [];

      for (const langCode of targetLanguages) {
        const evalResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/evaluate-translation-quality`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              languageCode: langCode,
              batchSize: options.batchSize || 50,
            }),
          }
        );

        if (evalResponse.ok) {
          const evalResult = await evalResponse.json();
          totalEvaluated += evalResult.evaluated || 0;
        } else {
          failedLanguages.push(langCode);
        }
      }

      results.steps.push({
        name: 'evaluate',
        success: failedLanguages.length === 0,
        evaluated: totalEvaluated,
        failed: failedLanguages,
      });
      console.log(`✓ Evaluated ${totalEvaluated} entries`);
    }

    // STEP 4: Auto-approve high quality
    if (action === 'approve' || action === 'full-pipeline') {
      console.log('Step 4: Auto-approving high quality translations...');
      
      const threshold = options.autoApproveThreshold || 85;
      
      const { data: approved, error } = await supabase
        .from('translations')
        .update({ 
          approved: true,
          review_status: 'approved'
        })
        .neq('language_code', 'en')
        .gte('quality_score', threshold)
        .eq('approved', false)
        .select('id');

      const approvedCount = approved?.length || 0;

      results.steps.push({
        name: 'approve',
        success: !error,
        approved: approvedCount,
        threshold,
      });
      console.log(`✓ Approved ${approvedCount} translations`);
    }

    console.log('=== Pipeline Complete ===');
    console.log('Results:', JSON.stringify(results, null, 2));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Pipeline Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
