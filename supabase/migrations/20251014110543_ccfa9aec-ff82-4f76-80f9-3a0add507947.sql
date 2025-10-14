-- Step 1: Update all evaluation_progress records with actual counts from translations
UPDATE evaluation_progress
SET 
  evaluated_keys = (
    SELECT COUNT(*) 
    FROM translations 
    WHERE language_code = evaluation_progress.language_code 
    AND quality_score IS NOT NULL
  ),
  total_keys = (
    SELECT COUNT(*)
    FROM translations
    WHERE language_code = 'en'
  ),
  status = CASE 
    WHEN (SELECT COUNT(*) FROM translations WHERE language_code = evaluation_progress.language_code AND quality_score IS NOT NULL) >= (SELECT COUNT(*) FROM translations WHERE language_code = 'en') 
    THEN 'completed'
    WHEN (SELECT COUNT(*) FROM translations WHERE language_code = evaluation_progress.language_code AND quality_score IS NOT NULL) > 0 
    THEN 'in_progress'
    ELSE 'idle'
  END,
  updated_at = NOW()
WHERE language_code != 'en';

-- Step 2: Create function to automatically sync evaluation_progress when translations change
CREATE OR REPLACE FUNCTION sync_evaluation_progress()
RETURNS TRIGGER AS $$
DECLARE
  lang_code text;
  total_evaluated integer;
  total_translations integer;
BEGIN
  -- Determine which language was affected
  lang_code := COALESCE(NEW.language_code, OLD.language_code);
  
  -- Skip if English (no evaluation needed)
  IF lang_code = 'en' THEN
    RETURN NEW;
  END IF;
  
  -- Count translations with quality scores for this language
  SELECT COUNT(*) INTO total_evaluated
  FROM translations 
  WHERE language_code = lang_code 
  AND quality_score IS NOT NULL;
  
  -- Get total English translations as baseline
  SELECT COUNT(*) INTO total_translations
  FROM translations
  WHERE language_code = 'en';
  
  -- Upsert evaluation_progress
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
      WHEN total_evaluated > 0 THEN 'in_progress'
      ELSE 'idle'
    END,
    NOW()
  )
  ON CONFLICT (language_code)
  DO UPDATE SET
    total_keys = EXCLUDED.total_keys,
    evaluated_keys = EXCLUDED.evaluated_keys,
    status = EXCLUDED.status,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger on translations table
DROP TRIGGER IF EXISTS sync_evaluation_on_translation_change ON translations;
CREATE TRIGGER sync_evaluation_on_translation_change
AFTER INSERT OR UPDATE OF quality_score OR DELETE ON translations
FOR EACH ROW
EXECUTE FUNCTION sync_evaluation_progress();