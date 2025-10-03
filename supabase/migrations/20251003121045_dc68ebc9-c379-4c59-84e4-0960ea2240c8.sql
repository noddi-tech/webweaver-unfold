-- Add Pricing navigation link to header_settings
DO $$
DECLARE
  settings_record RECORD;
  updated_links jsonb;
BEGIN
  -- Get the current header settings
  SELECT * INTO settings_record FROM public.header_settings LIMIT 1;
  
  IF settings_record.id IS NOT NULL THEN
    -- Check if Pricing link already exists
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(settings_record.navigation_links) AS link
      WHERE link->>'title' = 'Pricing'
    ) THEN
      -- Add Pricing link after Features
      updated_links := settings_record.navigation_links || jsonb_build_array(
        jsonb_build_object(
          'title', 'Pricing',
          'url', '/pricing',
          'active', true
        )
      );
      
      UPDATE public.header_settings
      SET navigation_links = updated_links
      WHERE id = settings_record.id;
    END IF;
  END IF;
END $$;