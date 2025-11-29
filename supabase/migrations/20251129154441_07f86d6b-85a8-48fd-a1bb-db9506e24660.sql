-- Update stale footer translations to match current footer_settings
UPDATE translations
SET translated_text = '© 2025 Navio. All rights reserved.',
    updated_at = now()
WHERE translation_key = 'footer.copyright'
  AND language_code = 'en';

UPDATE translations
SET translated_text = 'Navio builds the new standard for service operations - an intelligent platform that adapts capacity, schedules everything, and keeps customers in control.',
    updated_at = now()
WHERE translation_key = 'footer.company_description'
  AND language_code = 'en';