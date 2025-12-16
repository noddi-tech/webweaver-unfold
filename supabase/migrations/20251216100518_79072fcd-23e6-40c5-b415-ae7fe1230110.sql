-- Insert Core Loop step translations for English
INSERT INTO translations (language_code, translation_key, translated_text, approved)
VALUES 
  ('en', 'core_loop.step_1.title', 'Book.', true),
  ('en', 'core_loop.step_1.description', 'The customer picks a time — Navio handles the rest.', true),
  ('en', 'core_loop.step_2.title', 'Plan.', true),
  ('en', 'core_loop.step_2.description', 'Routes and lanes auto-optimize in real time.', true),
  ('en', 'core_loop.step_3.title', 'Execute.', true),
  ('en', 'core_loop.step_3.description', 'Technicians get clear, connected workflows.', true),
  ('en', 'core_loop.step_4.title', 'Analyze.', true),
  ('en', 'core_loop.step_4.description', 'Data flows instantly into insights.', true),
  ('en', 'core_loop.step_5.title', 'Re-engage.', true),
  ('en', 'core_loop.step_5.description', 'Customers return before they even think to.', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET 
  translated_text = EXCLUDED.translated_text,
  approved = EXCLUDED.approved,
  updated_at = now();