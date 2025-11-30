-- ============================================================
-- SCALABLE FIX: Translation System Health & Self-Healing
-- ============================================================
-- This migration implements:
-- 1. One-time cleanup of current stale translations
-- 2. One-time cleanup of stuck evaluation states
-- 3. Enhanced sync_evaluation_progress with auto-reset logic

-- ============================================================
-- PHASE 1: Reset Stale Translations (One-time Cleanup)
-- ============================================================
-- Fix all translations that were translated but incorrectly marked as stale
UPDATE translations
SET is_stale = false,
    review_status = 'pending',
    updated_at = now()
WHERE language_code != 'en'
AND translated_text IS NOT NULL
AND translated_text != ''
AND translated_text != translation_key
AND is_stale = true;

-- ============================================================
-- PHASE 2: Reset Stuck Evaluation Progress (One-time Cleanup)
-- ============================================================
-- Reset all evaluation progress to correct status based on completion
UPDATE evaluation_progress
SET 
  status = CASE 
    WHEN evaluated_keys >= total_keys THEN 'completed'
    ELSE 'idle'
  END,
  started_at = CASE 
    WHEN evaluated_keys >= total_keys THEN started_at
    ELSE now()
  END,
  completed_at = CASE 
    WHEN evaluated_keys >= total_keys THEN now()
    ELSE null
  END,
  updated_at = now()
WHERE status = 'in_progress';

-- ============================================================
-- PHASE 3: Enhanced sync_evaluation_progress Function
-- ============================================================
-- Replace existing function with enhanced version (preserves triggers)
CREATE OR REPLACE FUNCTION public.sync_evaluation_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  lang_code text;
  total_evaluated integer;
  total_translations integer;
  current_status text;
  last_update_time timestamptz;
  hours_since_update numeric;
BEGIN
  lang_code := COALESCE(NEW.language_code, OLD.language_code);
  
  -- Skip English (source language)
  IF lang_code = 'en' THEN
    RETURN NEW;
  END IF;
  
  -- Get current status and last update time
  SELECT status, updated_at INTO current_status, last_update_time
  FROM evaluation_progress
  WHERE language_code = lang_code;
  
  -- Calculate hours since last update
  IF last_update_time IS NOT NULL THEN
    hours_since_update := EXTRACT(EPOCH FROM (now() - last_update_time)) / 3600;
  ELSE
    hours_since_update := 0;
  END IF;
  
  -- Count evaluated translations (those with quality_score)
  SELECT COUNT(*) INTO total_evaluated
  FROM translations 
  WHERE language_code = lang_code 
  AND quality_score IS NOT NULL;
  
  -- Get total translations from English
  SELECT COUNT(*) INTO total_translations
  FROM translations
  WHERE language_code = 'en';
  
  -- ✅ SELF-HEALING LOGIC: Auto-reset stuck evaluations
  -- If status is 'in_progress' and hasn't been updated in >1 hour, reset to 'idle'
  IF current_status = 'in_progress' AND hours_since_update > 1 THEN
    current_status := 'idle';
    RAISE NOTICE 'Auto-reset stuck evaluation for %: stuck for % hours', lang_code, hours_since_update;
  END IF;
  
  -- Upsert with intelligent status management
  INSERT INTO evaluation_progress (
    language_code, 
    total_keys, 
    evaluated_keys, 
    status,
    updated_at
  )
  VALUES (
    lang_code,
    total_translations,
    total_evaluated,
    CASE 
      -- Mark as completed if all keys evaluated
      WHEN total_evaluated >= total_translations THEN 'completed'
      -- Otherwise preserve current status (with auto-reset applied above)
      ELSE COALESCE(current_status, 'idle')
    END,
    now()
  )
  ON CONFLICT (language_code)
  DO UPDATE SET
    total_keys = EXCLUDED.total_keys,
    evaluated_keys = EXCLUDED.evaluated_keys,
    status = CASE 
      -- Mark as completed if all keys evaluated
      WHEN EXCLUDED.evaluated_keys >= EXCLUDED.total_keys THEN 'completed'
      -- Auto-reset if stuck for >1 hour
      WHEN evaluation_progress.status = 'in_progress' 
           AND evaluation_progress.updated_at < now() - INTERVAL '1 hour' THEN 'idle'
      -- Otherwise preserve current status
      ELSE evaluation_progress.status
    END,
    completed_at = CASE
      WHEN EXCLUDED.evaluated_keys >= EXCLUDED.total_keys THEN now()
      ELSE evaluation_progress.completed_at
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

-- ============================================================
-- Summary
-- ============================================================
-- ✅ Stale translations reset: is_stale = false
-- ✅ Stuck evaluations reset to correct states
-- ✅ Database function enhanced with auto-reset (>1h)
-- ✅ System is now self-healing and scalable