-- Replace remaining 'Noddi' with 'Navio' in translations
-- This updates Greek and Finnish why_noddi.subtitle entries
UPDATE translations 
SET 
  translated_text = REPLACE(translated_text, 'Noddi', 'Navio'),
  updated_at = now()
WHERE LOWER(translated_text) LIKE '%noddi%';