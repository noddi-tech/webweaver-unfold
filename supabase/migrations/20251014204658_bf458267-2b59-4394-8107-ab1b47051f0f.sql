-- Step 1: Clean up existing duplicate .label keys where parent key exists and is used
-- These are the keys causing conflicts
DELETE FROM translations
WHERE translation_key LIKE '%.label'
AND translation_key IN (
  'why_it_matters.tab_advantage.label',
  'why_it_matters.tab_opportunity.label',
  'why_it_matters.tab_problem.label'
);

-- Step 2: Create function to check for translation key conflicts
CREATE OR REPLACE FUNCTION check_translation_key_conflict()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS enforce_translation_key_hierarchy ON translations;
CREATE TRIGGER enforce_translation_key_hierarchy
  BEFORE INSERT OR UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION check_translation_key_conflict();