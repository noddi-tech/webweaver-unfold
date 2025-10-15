-- Function to automatically sync language visibility based on approval percentage
CREATE OR REPLACE FUNCTION sync_language_visibility()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to call sync after translation changes
CREATE OR REPLACE FUNCTION trigger_sync_language_visibility()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM sync_language_visibility();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on translations table
DROP TRIGGER IF EXISTS sync_visibility_after_translation_change ON translations;
CREATE TRIGGER sync_visibility_after_translation_change
AFTER INSERT OR UPDATE OR DELETE ON translations
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_sync_language_visibility();

-- Immediate fix: hide Norwegian since it has 0% approval
UPDATE languages SET show_in_switcher = false WHERE code = 'no';

-- Run initial sync
SELECT sync_language_visibility();