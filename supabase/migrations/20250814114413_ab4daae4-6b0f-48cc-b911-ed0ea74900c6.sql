-- Add missing CTA button text for hero section
INSERT INTO public.text_content (page_location, section, element_type, content, content_type, active, sort_order, color_token) 
VALUES ('index', 'hero', 'cta', 'Get Started Free', 'button', true, 0, 'primary-foreground')
ON CONFLICT DO NOTHING;