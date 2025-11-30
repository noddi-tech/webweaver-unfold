-- Phase 4: Database content rebrand from Noddi to Navio

-- Update all English translations containing "Noddi" to "Navio"
UPDATE translations 
SET translated_text = REPLACE(translated_text, 'Noddi Tech', 'Navio'),
    updated_at = now()
WHERE language_code = 'en' 
  AND translated_text ILIKE '%Noddi Tech%';

UPDATE translations 
SET translated_text = REPLACE(translated_text, 'Noddi', 'Navio'),
    updated_at = now()
WHERE language_code = 'en' 
  AND translated_text ILIKE '%Noddi%'
  AND translated_text NOT ILIKE '%Navio%';

-- Update page meta translations containing "Noddi" to "Navio"
UPDATE page_meta_translations 
SET meta_title = REPLACE(REPLACE(meta_title, 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    meta_description = REPLACE(REPLACE(meta_description, 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    og_title = REPLACE(REPLACE(COALESCE(og_title, ''), 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    og_description = REPLACE(REPLACE(COALESCE(og_description, ''), 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    twitter_title = REPLACE(REPLACE(COALESCE(twitter_title, ''), 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    twitter_description = REPLACE(REPLACE(COALESCE(twitter_description, ''), 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    updated_at = now()
WHERE meta_title ILIKE '%Noddi%' 
   OR meta_description ILIKE '%Noddi%'
   OR og_title ILIKE '%Noddi%'
   OR og_description ILIKE '%Noddi%'
   OR twitter_title ILIKE '%Noddi%'
   OR twitter_description ILIKE '%Noddi%';

-- Update footer settings company name
UPDATE footer_settings
SET company_name = 'Navio',
    updated_at = now()
WHERE company_name ILIKE '%Noddi%';

-- Update text_content table
UPDATE text_content
SET content = REPLACE(REPLACE(content, 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    updated_at = now()
WHERE content ILIKE '%Noddi%';

-- Update static files (TOV document)
UPDATE static_files
SET content = REPLACE(REPLACE(content, 'Noddi Tech', 'Navio'), 'Noddi', 'Navio'),
    file_path = REPLACE(file_path, 'tov-noddi-tech.md', 'tov-navio.md'),
    updated_at = now()
WHERE file_path = 'content/brand/tov-noddi-tech.md';
