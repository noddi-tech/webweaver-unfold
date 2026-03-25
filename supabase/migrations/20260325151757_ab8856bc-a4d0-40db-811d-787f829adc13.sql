-- Update title
UPDATE translations SET translated_text = 'See how Navio fits your operation', updated_at = now() WHERE translation_key = 'final_cta.title' AND language_code = 'en';

-- Update footer
UPDATE translations SET translated_text = 'No credit card required · Free consultation · See results in 30 days', updated_at = now() WHERE translation_key = 'final_cta.footer_text' AND language_code = 'en';

-- Insert secondary link (new key)
INSERT INTO translations (translation_key, language_code, translated_text, approved, context, page_location)
VALUES ('final_cta.link_secondary', 'en', 'Or explore features', true, 'Secondary link below CTA button', 'homepage')
ON CONFLICT (translation_key, language_code) DO UPDATE SET translated_text = 'Or explore features', updated_at = now();

-- Delete subtitle (no longer used)
DELETE FROM translations WHERE translation_key = 'final_cta.subtitle';