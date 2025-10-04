-- Create comprehensive CMS entries for pricing page
INSERT INTO text_content (page_location, section, element_type, content, active, sort_order) VALUES
  -- Hero section (10-80)
  ('pricing', 'hero', 'h1', 'Pay as you grow', true, 10),
  ('pricing', 'hero', 'p', 'Transparent revenue-based pricing that scales with your business', true, 20),
  ('pricing', 'hero', 'usp_1', 'World class UX', true, 30),
  ('pricing', 'hero', 'usp_2', 'Rates decrease as you grow', true, 40),
  ('pricing', 'hero', 'usp_3', 'Optimize your margin, not your headcount', true, 50),
  ('pricing', 'hero', 'label_currency', 'View pricing in:', true, 60),
  ('pricing', 'hero', 'clarifier', 'Your cost is a small percentage of your processed revenue — this calculator shows what that means for your business.', true, 70),
  
  -- Contract selector (100-110)
  ('pricing', 'contract_selector', 'label', 'Contract type:', true, 100),
  
  -- Pricing cards (200-310)
  ('pricing', 'pricing_cards', 'h4_example', 'Example scenario:', true, 200),
  ('pricing', 'pricing_cards', 'h4_cost', 'Annual cost:', true, 210),
  ('pricing', 'pricing_cards', 'label_rate', 'Effective rate:', true, 220),
  ('pricing', 'pricing_cards', 'label_garage', 'Garage:', true, 230),
  ('pricing', 'pricing_cards', 'label_shop', 'Shop:', true, 240),
  ('pricing', 'pricing_cards', 'label_mobile', 'Mobile:', true, 250),
  ('pricing', 'pricing_cards', 'button_show_details', 'Show breakdown', true, 260),
  ('pricing', 'pricing_cards', 'button_hide_details', 'Hide breakdown', true, 270),
  ('pricing', 'pricing_cards', 'label_garage_rate', 'Garage rate:', true, 280),
  ('pricing', 'pricing_cards', 'label_shop_rate', 'Shop rate:', true, 290),
  ('pricing', 'pricing_cards', 'label_mobile_rate', 'Mobile rate:', true, 300),
  ('pricing', 'pricing_cards', 'label_range', 'Revenue range:', true, 310),
  
  -- Slider component (400-430)
  ('pricing', 'slider', 'label', 'Total annual revenue:', true, 400),
  ('pricing', 'slider', 'preview_label', 'Estimated annual cost:', true, 410),
  ('pricing', 'slider', 'link_text', 'Calculate your full breakdown »', true, 420),
  
  -- Calculator CTA (500-520)
  ('pricing', 'calculator_cta', 'h2', 'Need a Precise Estimate?', true, 500),
  ('pricing', 'calculator_cta', 'p', 'Enter your revenue and service mix to see your cost.', true, 510),
  ('pricing', 'calculator_cta', 'button', 'Open Advanced Calculator', true, 520),
  
  -- Value props (600-650)
  ('pricing', 'value_props', 'h3_ux', 'World-class UX', true, 600),
  ('pricing', 'value_props', 'p_ux', 'High retention thanks to seamless support experience.', true, 610),
  ('pricing', 'value_props', 'h3_ai', 'AI-Powered', true, 620),
  ('pricing', 'value_props', 'p_ai', 'Smart prediction, routing, and automation.', true, 630),
  ('pricing', 'value_props', 'h3_save', 'Save 30%', true, 640),
  ('pricing', 'value_props', 'p_save', 'Optimize agent costs while scaling.', true, 650),
  
  -- Final CTA (700-720)
  ('pricing', 'final_cta', 'h2', 'Ready to transform your support experience?', true, 700),
  ('pricing', 'final_cta', 'p', 'Join leaders using Noddi to boost loyalty and reduce costs.', true, 710),
  ('pricing', 'final_cta', 'button', 'Book a Demo', true, 720)
ON CONFLICT DO NOTHING;