-- Insert pricing page text content entries
-- Hero Section
INSERT INTO text_content (page_location, section, element_type, content, color_token, content_type, sort_order) VALUES
('pricing', 'hero', 'hero_h1', 'Pay as you grow', 'foreground', 'heading', 1),
('pricing', 'hero', 'hero_p', 'Transparent revenue-based pricing. Only pay for what you use—no surprises, no contracts, no hidden fees.', 'muted-foreground', 'paragraph', 2),
('pricing', 'hero', 'hero_usp_1', 'No fixed monthly fees', 'foreground', 'text', 3),
('pricing', 'hero', 'hero_usp_2', 'Pay only for revenue processed', 'foreground', 'text', 4),
('pricing', 'hero', 'hero_usp_3', 'Rates decrease as you grow', 'foreground', 'text', 5),

-- Currency Selector Section
('pricing', 'currency_selector', 'currency_label', 'Select Currency:', 'foreground', 'label', 10),

-- Contract Type Selector
('pricing', 'contract_selector', 'contract_label', 'Contract Type:', 'foreground', 'label', 20),
('pricing', 'contract_selector', 'contract_none', 'No Contract', 'foreground', 'text', 21),
('pricing', 'contract_selector', 'contract_monthly', 'Monthly (5% off)', 'foreground', 'text', 22),
('pricing', 'contract_selector', 'contract_yearly', 'Yearly (10% off)', 'foreground', 'text', 23),

-- Pricing Cards Section
('pricing', 'pricing_cards', 'pricing_cards_h2', 'Pricing Examples', 'foreground', 'heading', 30),
('pricing', 'pricing_cards', 'pricing_cards_h4_example', 'Example scenario:', 'foreground', 'heading', 31),
('pricing', 'pricing_cards', 'pricing_cards_label_annual', 'Annual cost:', 'foreground', 'label', 32),
('pricing', 'pricing_cards', 'pricing_cards_label_rate', 'Effective rate:', 'foreground', 'label', 33),
('pricing', 'pricing_cards', 'pricing_cards_label_garage', 'Garage:', 'muted-foreground', 'label', 34),
('pricing', 'pricing_cards', 'pricing_cards_label_shop', 'Shop:', 'muted-foreground', 'label', 35),
('pricing', 'pricing_cards', 'pricing_cards_label_mobile', 'Mobile:', 'muted-foreground', 'label', 36),
('pricing', 'pricing_cards', 'pricing_cards_save_prefix', 'Save', 'foreground', 'text', 37),

-- CTA Section
('pricing', 'cta', 'cta_button_demo', 'Book a demo', 'primary-foreground', 'button', 40),

-- Value Proposition Section
('pricing', 'value_prop', 'value_prop_h2', 'Why Choose Revenue-Based Pricing?', 'foreground', 'heading', 50),
('pricing', 'value_prop', 'value_prop_p', 'Our pricing model scales with your success. As your revenue grows, your effective rate decreases—meaning you pay less per transaction as you process more volume.', 'muted-foreground', 'paragraph', 51),

-- Calculator Section
('pricing', 'calculator', 'calculator_h3', 'Calculate Your Exact Pricing', 'foreground', 'heading', 60),
('pricing', 'calculator', 'calculator_p', 'Want to see exactly what you''ll pay? Use our interactive calculator to get a precise quote based on your specific revenue figures.', 'muted-foreground', 'paragraph', 61),
('pricing', 'calculator', 'calculator_button', 'Open Pricing Calculator', 'primary-foreground', 'button', 62),

-- Chart Section
('pricing', 'chart', 'chart_h3', 'Rate Decreases as Revenue Grows', 'foreground', 'heading', 70),
('pricing', 'chart', 'chart_p', 'See how your effective rate decreases as your business scales.', 'muted-foreground', 'paragraph', 71),

-- FAQ Section
('pricing', 'faq', 'faq_h2', 'Frequently Asked Questions', 'foreground', 'heading', 80);