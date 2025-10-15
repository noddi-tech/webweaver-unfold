-- Fix sync_evaluation_progress trigger to preserve status
CREATE OR REPLACE FUNCTION public.sync_evaluation_progress()
RETURNS TRIGGER AS $$
DECLARE
  lang_code text;
  total_evaluated integer;
  total_translations integer;
  current_status text;
BEGIN
  lang_code := COALESCE(NEW.language_code, OLD.language_code);
  
  IF lang_code = 'en' THEN
    RETURN NEW;
  END IF;
  
  -- Get current status
  SELECT status INTO current_status
  FROM evaluation_progress
  WHERE language_code = lang_code;
  
  SELECT COUNT(*) INTO total_evaluated
  FROM translations 
  WHERE language_code = lang_code 
  AND quality_score IS NOT NULL;
  
  SELECT COUNT(*) INTO total_translations
  FROM translations
  WHERE language_code = 'en';
  
  -- Upsert but PRESERVE status unless evaluation is complete
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
      WHEN total_evaluated >= total_translations THEN 'completed'
      ELSE COALESCE(current_status, 'idle')
    END,
    NOW()
  )
  ON CONFLICT (language_code)
  DO UPDATE SET
    total_keys = EXCLUDED.total_keys,
    evaluated_keys = EXCLUDED.evaluated_keys,
    status = CASE 
      WHEN EXCLUDED.evaluated_keys >= EXCLUDED.total_keys THEN 'completed'
      ELSE evaluation_progress.status
    END,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Clean up stuck "in_progress" statuses
UPDATE evaluation_progress
SET status = CASE
  WHEN evaluated_keys >= total_keys THEN 'completed'
  WHEN evaluated_keys = 0 THEN 'idle'
  ELSE 'paused'
END
WHERE status = 'in_progress';