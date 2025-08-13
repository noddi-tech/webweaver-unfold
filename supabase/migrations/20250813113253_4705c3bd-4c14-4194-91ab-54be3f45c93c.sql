-- Create missing sections for Demo page
INSERT INTO public.sections (name, display_name, page_location, sort_order, background_token, text_token, padding_token, margin_token, max_width_token, active) VALUES
('hero', 'Hero Section', 'demo', 0, 'background', 'foreground', 'section', 'none', 'container', true),
('video-showcase', 'Video Showcase', 'demo', 1, 'card', 'foreground', 'section', 'none', 'container', true),
('features', 'Features', 'demo', 2, 'background', 'foreground', 'section', 'none', 'container', true);

-- Create missing sections for Features page
INSERT INTO public.sections (name, display_name, page_location, sort_order, background_token, text_token, padding_token, margin_token, max_width_token, active) VALUES
('hero', 'Hero Section', 'features', 0, 'background', 'foreground', 'section', 'none', 'container', true),
('features', 'Features Grid', 'features', 1, 'background', 'foreground', 'section', 'none', 'container', true);

-- Update existing contact section to be more descriptive
UPDATE public.sections SET display_name = 'Contact Form & Info' WHERE page_location = 'contact' AND name = 'contact';