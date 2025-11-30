// ============================================================
// EVALUATION WATCHDOG - Auto-reset stuck evaluations
// ============================================================
// This function runs periodically to detect and reset stuck
// evaluations that haven't updated in >15 minutes.
//
// TO SET UP CRON (run this SQL in Supabase SQL Editor):
// 
// SELECT cron.schedule(
//   'evaluation-watchdog',
//   '*/10 * * * *',  -- Every 10 minutes
//   $$
//   SELECT net.http_post(
//     url:='https://ouhfgazomdmirdazvjys.supabase.co/functions/v1/evaluation-watchdog',
//     headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGZnYXpvbWRtaXJkYXp2anlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI5OTEsImV4cCI6MjA3MDE0ODk5MX0.w5iC3BX6u5vrnr1fMj5HyYUwEtYRwsoTVx3oAQ2foCQ"}'::jsonb
//   ) as request_id;
//   $$
// );
//
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🐕 Evaluation Watchdog: Starting routine check...');

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find evaluations stuck for >15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: stuckEvals, error: queryError } = await supabase
      .from('evaluation_progress')
      .select('*')
      .eq('status', 'in_progress')
      .lt('updated_at', fifteenMinutesAgo);

    if (queryError) {
      console.error('❌ Query error:', queryError);
      throw queryError;
    }

    if (!stuckEvals || stuckEvals.length === 0) {
      console.log('✅ No stuck evaluations found. All clear!');
      return new Response(JSON.stringify({ 
        status: 'healthy',
        message: 'No stuck evaluations detected',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`⚠️ Found ${stuckEvals.length} stuck evaluations:`);
    
    const resetActions = [];
    
    for (const stuck of stuckEvals) {
      const minutesSinceUpdate = Math.round((Date.now() - new Date(stuck.updated_at).getTime()) / (1000 * 60));
      console.log(`  • ${stuck.language_code}: stuck for ${minutesSinceUpdate} minutes`);
      
      // Reset to idle for manual restart
      resetActions.push({
        language_code: stuck.language_code,
        action: 'reset_to_idle',
        minutes_stuck: minutesSinceUpdate
      });
    }

    // Reset all stuck evaluations to 'idle'
    const { error: updateError } = await supabase
      .from('evaluation_progress')
      .update({ 
        status: 'idle',
        error_message: 'Auto-reset by watchdog: evaluation was stuck',
        updated_at: new Date().toISOString()
      })
      .in('language_code', stuckEvals.map(s => s.language_code));

    if (updateError) {
      console.error('❌ Failed to reset stuck evaluations:', updateError);
      throw updateError;
    }

    console.log(`✅ Successfully reset ${stuckEvals.length} stuck evaluations to idle`);

    return new Response(JSON.stringify({ 
      status: 'recovered',
      message: `Reset ${stuckEvals.length} stuck evaluations`,
      actions: resetActions,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Watchdog error:', error);
    return new Response(JSON.stringify({ 
      error: 'Watchdog failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
