-- Fix Google Fonts URLs with correct weight range (200..800 instead of 100..800)
UPDATE typography_settings 
SET 
  font_google_url = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap',
  mono_font_google_url = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@200..800&display=swap',
  updated_at = now()
WHERE is_active = true;