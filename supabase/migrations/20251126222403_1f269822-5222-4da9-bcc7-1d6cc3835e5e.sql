-- Phase 2: Fix search_path for existing functions

-- Fix check_translation_key_conflict
CREATE OR REPLACE FUNCTION public.check_translation_key_conflict()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  parent_key text;
  child_pattern text;
  conflict_count int;
BEGIN
  -- Extract potential parent key (remove last segment if ends with a word)
  parent_key := regexp_replace(NEW.translation_key, '\.[^.]+$', '');
  child_pattern := NEW.translation_key || '.%';
  
  -- Check if inserting a parent key when children exist
  IF NEW.translation_key NOT LIKE '%.%.%' THEN
    SELECT COUNT(*) INTO conflict_count
    FROM translations
    WHERE language_code = NEW.language_code
    AND translation_key LIKE child_pattern
    AND translation_key != NEW.translation_key;
    
    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Cannot insert parent key "%" because child keys exist (e.g., "%.label"). Use either parent OR children, not both.', 
        NEW.translation_key, NEW.translation_key;
    END IF;
  END IF;
  
  -- Check if inserting a child key when parent exists
  IF parent_key != '' AND parent_key != NEW.translation_key THEN
    SELECT COUNT(*) INTO conflict_count
    FROM translations
    WHERE language_code = NEW.language_code
    AND translation_key = parent_key;
    
    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Cannot insert child key "%" because parent key "%" already exists. Use either parent OR children, not both.', 
        NEW.translation_key, parent_key;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix sync_evaluation_progress
CREATE OR REPLACE FUNCTION public.sync_evaluation_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- Fix sync_language_visibility
CREATE OR REPLACE FUNCTION public.sync_language_visibility()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-hide languages with < 95% approval rate (except English)
  UPDATE languages
  SET show_in_switcher = false
  WHERE code != 'en' 
  AND code IN (
    SELECT language_code 
    FROM translations 
    GROUP BY language_code 
    HAVING 
      COUNT(*) > 0 AND
      (COUNT(CASE WHEN approved = true THEN 1 END)::float / COUNT(*)) < 0.95
  );
  
  -- Auto-show languages with >= 95% approval rate
  UPDATE languages
  SET show_in_switcher = true
  WHERE code IN (
    SELECT language_code 
    FROM translations 
    GROUP BY language_code 
    HAVING 
      COUNT(*) > 0 AND
      (COUNT(CASE WHEN approved = true THEN 1 END)::float / COUNT(*)) >= 0.95
  );
  
  -- Always show English
  UPDATE languages SET show_in_switcher = true WHERE code = 'en';
END;
$$;

-- Fix trigger_sync_language_visibility
CREATE OR REPLACE FUNCTION public.trigger_sync_language_visibility()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM sync_language_visibility();
  RETURN NEW;
END;
$$;

-- Fix auto_generate_solution_slug
CREATE OR REPLACE FUNCTION public.auto_generate_solution_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

-- Fix generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(text_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;