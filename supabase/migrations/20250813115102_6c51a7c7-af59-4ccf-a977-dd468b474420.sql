-- Create header and footer sections in sections table
INSERT INTO public.sections (name, display_name, page_location, background_token, text_token, padding_token, margin_token, max_width_token, sort_order, active)
VALUES 
  ('header', 'Header/Navigation', 'global', 'background', 'foreground', 'section', 'none', 'container', 1, true),
  ('footer', 'Footer', 'global', 'background', 'foreground', 'section', 'none', 'container', 2, true);

-- Create header_settings table for configurable header content
CREATE TABLE public.header_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  navigation_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  show_auth_buttons BOOLEAN NOT NULL DEFAULT true,
  sign_in_text TEXT NOT NULL DEFAULT 'Sign In',
  get_started_text TEXT NOT NULL DEFAULT 'Get Started',
  show_global_usp_bar BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create footer_settings table for configurable footer content  
CREATE TABLE public.footer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Noddi Tech',
  company_description TEXT,
  contact_info JSONB NOT NULL DEFAULT '[]'::jsonb,
  quick_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  legal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  copyright_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.header_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for header_settings
CREATE POLICY "Header settings are viewable by everyone" 
ON public.header_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Header settings can be managed by authenticated users" 
ON public.header_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for footer_settings
CREATE POLICY "Footer settings are viewable by everyone" 
ON public.footer_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Footer settings can be managed by authenticated users" 
ON public.footer_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_header_settings_updated_at
BEFORE UPDATE ON public.header_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_footer_settings_updated_at
BEFORE UPDATE ON public.footer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default header settings
INSERT INTO public.header_settings (navigation_links, contact_info) 
VALUES (
  '[
    {"title": "Features", "url": "/features", "active": true},
    {"title": "Demo", "url": "/demo", "active": true},
    {"title": "Team", "url": "/team", "active": true},
    {"title": "Contact", "url": "/contact", "active": true}
  ]'::jsonb,
  '[]'::jsonb
);

-- Insert default footer settings
INSERT INTO public.footer_settings (
  company_name, 
  company_description,
  contact_info,
  quick_links,
  legal_links,
  copyright_text
) VALUES (
  'Noddi Tech',
  'Empowering automotive maintenance providers with intelligent logistics technology for optimized operations and exceptional service delivery.',
  '[
    {"icon": "Mail", "title": "Email", "value": "contact@noddi.tech", "link": "mailto:contact@noddi.tech"},
    {"icon": "Phone", "title": "Phone", "value": "+1 (555) 123-4567", "link": "tel:+15551234567"},
    {"icon": "MapPin", "title": "Location", "value": "San Francisco, CA", "link": null}
  ]'::jsonb,
  '[
    {"title": "Home", "url": "#home", "active": true},
    {"title": "Features", "url": "#features", "active": true},
    {"title": "Demo", "url": "#demo", "active": true},
    {"title": "Contact", "url": "#contact", "active": true}
  ]'::jsonb,
  '[
    {"title": "Privacy Policy", "url": "#", "active": true},
    {"title": "Terms of Service", "url": "#", "active": true},
    {"title": "Cookie Policy", "url": "#", "active": true},
    {"title": "Support", "url": "#", "active": true}
  ]'::jsonb,
  '© 2024 Noddi Tech. All rights reserved. Built with ❤️ by the Noddi Tech team.'
);