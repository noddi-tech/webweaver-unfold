-- Add "Switch language" translations for all enabled languages
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location) VALUES
  ('common.switch_language', 'en', 'Switch language', true, 'global'),
  ('common.switch_language', 'de', 'Sprache wechseln', true, 'global'),
  ('common.switch_language', 'fr', 'Changer de langue', true, 'global'),
  ('common.switch_language', 'es', 'Cambiar idioma', true, 'global'),
  ('common.switch_language', 'it', 'Cambia lingua', true, 'global'),
  ('common.switch_language', 'pt', 'Trocar idioma', true, 'global'),
  ('common.switch_language', 'nl', 'Taal wijzigen', true, 'global'),
  ('common.switch_language', 'pl', 'Zmień język', true, 'global'),
  ('common.switch_language', 'sv', 'Byt språk', true, 'global'),
  ('common.switch_language', 'no', 'Bytt språk', true, 'global'),
  ('common.switch_language', 'da', 'Skift sprog', true, 'global'),
  ('common.switch_language', 'fi', 'Vaihda kieli', true, 'global'),
  ('common.switch_language', 'cs', 'Změnit jazyk', true, 'global'),
  ('common.switch_language', 'hu', 'Nyelv váltása', true, 'global'),
  ('common.switch_language', 'ro', 'Schimbă limba', true, 'global'),
  ('common.switch_language', 'el', 'Αλλαγή γλώσσας', true, 'global')
ON CONFLICT (translation_key, language_code) DO UPDATE
SET translated_text = EXCLUDED.translated_text, approved = EXCLUDED.approved;