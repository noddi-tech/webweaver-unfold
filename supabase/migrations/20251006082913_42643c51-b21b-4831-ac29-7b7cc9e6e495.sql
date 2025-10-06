-- Add CMS entries for No Hidden Costs banner
INSERT INTO text_content (page_location, section, element_type, content, active, sort_order) VALUES
  ('pricing', 'no_hidden_costs', 'h3', 'No Hidden Costs', true, 800),
  ('pricing', 'no_hidden_costs', 'subtitle', 'Simple, transparent pricing with no surprises', true, 810),
  ('pricing', 'no_hidden_costs', 'item_1_title', 'No seat cost', true, 820),
  ('pricing', 'no_hidden_costs', 'item_1_desc', 'Pay for usage, not headcount', true, 830),
  ('pricing', 'no_hidden_costs', 'item_2_title', 'No cost per location', true, 840),
  ('pricing', 'no_hidden_costs', 'item_2_desc', 'Same rate across all branches', true, 850),
  ('pricing', 'no_hidden_costs', 'item_3_title', 'No surprise fees', true, 860),
  ('pricing', 'no_hidden_costs', 'item_3_desc', 'What you see is what you pay', true, 870)
ON CONFLICT DO NOTHING;