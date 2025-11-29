import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const VerifyRequestSchema = z.object({
  translationKey: z.string().min(1).max(500),
  originalText: z.string().min(1),
  translatedText: z.string().min(1),
  targetLanguage: z.string().min(2).max(10).regex(/^[a-z]{2}(-[A-Z]{2})?$/),
  targetLanguageName: z.string().min(1).max(100)
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Translation Verification Function Started ===');

  try {
    const body = await req.json();
    
    // Validate input
    const validation = VerifyRequestSchema.safeParse(body);
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

    const { translationKey, originalText, translatedText, targetLanguage, targetLanguageName } = validation.data;
    
    console.log('Verifying translation:', {
      key: translationKey,
      targetLanguage,
      originalLength: originalText.length,
      translatedLength: translatedText.length
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use GPT-5-mini for back-translation and verification
    const verificationPrompt = `You are a translation quality verifier using back-translation methodology.

**Original English text:**
"${originalText}"

**Translation (${targetLanguageName}):**
"${translatedText}"

**Your Task:**
1. Back-translate the ${targetLanguageName} text to English
2. Compare the back-translation with the original English text
3. Analyze if the translation appears to be word-for-word literal (a common mistake)
4. Evaluate fluency and naturalness in ${targetLanguageName}
5. Check if idiomatic expressions were adapted naturally

**Return ONLY valid JSON:**
{
  "back_translation": "your back-translation to English",
  "meaning_preserved": true/false,
  "appears_literal": true/false,
  "fluency_score": 0-100,
  "issues": ["issue1", "issue2"],
  "suggested_improvement": "optional suggestion if quality is low"
}

**Evaluation Guidelines:**
- meaning_preserved: true if back-translation conveys the same core message as original
- appears_literal: true if translation looks like direct word-for-word substitution
- fluency_score: 85+ = excellent, 70-84 = good, <70 = needs improvement
- issues: List specific problems (e.g., "word-for-word translation", "unnatural phrasing", "lost nuance")`;

    console.log('Calling GPT-5-mini for back-translation verification...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a translation quality expert specializing in back-translation verification. Return ONLY valid JSON.' 
          },
          { role: 'user', content: verificationPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const verificationContent = data.choices[0].message.content;
    
    // Parse verification result
    let verification;
    try {
      const jsonMatch = verificationContent.match(/```json\n([\s\S]*?)\n```/);
      const jsonToParse = jsonMatch ? jsonMatch[1] : verificationContent;
      verification = JSON.parse(jsonToParse);
      console.log('Verification result:', verification);
    } catch (e) {
      console.error('Failed to parse verification result:', e);
      throw new Error('Failed to parse AI verification response');
    }

    // Calculate overall quality score based on verification
    let verificationScore = verification.fluency_score || 0;
    
    // Penalize literal translations
    if (verification.appears_literal) {
      verificationScore = Math.min(verificationScore, 60);
      verification.issues = verification.issues || [];
      verification.issues.push('Translation appears to be word-for-word literal');
    }
    
    // Penalize if meaning not preserved
    if (!verification.meaning_preserved) {
      verificationScore = Math.min(verificationScore, 50);
      verification.issues = verification.issues || [];
      verification.issues.push('Original meaning not fully preserved');
    }

    return new Response(JSON.stringify({ 
      translationKey,
      verification,
      verificationScore,
      shouldRefine: verificationScore < 70 || verification.appears_literal
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== Verification Function Error ===');
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
