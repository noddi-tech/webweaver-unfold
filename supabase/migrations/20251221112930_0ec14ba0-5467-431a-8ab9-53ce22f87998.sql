-- Create customer_stories table
CREATE TABLE public.customer_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_logo_url text,
  title text NOT NULL,
  hero_image_url text,
  about_company text,
  use_case text,
  impact_statement text,
  product_screenshot_url text,
  quote_text text,
  quote_author text,
  quote_author_title text,
  results jsonb DEFAULT '[]'::jsonb,
  final_cta_heading text DEFAULT 'Ready to transform your business?',
  final_cta_description text,
  final_cta_button_text text DEFAULT 'Book a Demo',
  final_cta_button_url text DEFAULT '/contact',
  active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Stories are viewable by everyone" 
ON public.customer_stories 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage stories" 
ON public.customer_stories 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_customer_stories_updated_at
BEFORE UPDATE ON public.customer_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data with current mock content
INSERT INTO public.customer_stories (
  slug,
  company_name,
  title,
  hero_image_url,
  about_company,
  use_case,
  impact_statement,
  product_screenshot_url,
  quote_text,
  quote_author,
  quote_author_title,
  results,
  final_cta_heading,
  final_cta_description,
  final_cta_button_text,
  final_cta_button_url
) VALUES (
  'nordic-fleet-solutions',
  'Nordic Fleet Solutions',
  'How Nordic Fleet Solutions increased customer satisfaction by 47%',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=600&fit=crop',
  'Nordic Fleet Solutions is a leading vehicle service provider operating across Scandinavia. With over 150 service locations and a fleet of 2,000+ mobile service units, they handle more than 50,000 service appointments monthly. Their commitment to innovation and customer experience has made them a pioneer in the automotive service industry.',
  E'Nordic Fleet Solutions needed a unified platform that could handle their complex multi-location service network while delivering a seamless customer experience.\n\nTheir main requirements included real-time availability management across 150+ locations, automated customer communications, and a mobile-first booking experience that matched modern consumer expectations.\n\nThe team chose Navio for its ability to integrate with their existing systems while providing a complete customer journey – from initial booking through service completion and follow-up.',
  E'Since implementing Navio, Nordic Fleet Solutions has experienced a fundamental shift in their operational efficiency and customer satisfaction.\n\nThe integrated booking system has eliminated double-bookings and reduced scheduling conflicts by 89%. Automated reminders have decreased no-show rates from 12% to just 3%, recovering significant revenue that was previously lost.\n\nMost importantly, the seamless customer experience has driven a 47% increase in their NPS score, with customers particularly praising the easy booking process and transparent communication throughout their service journey.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
  'Navio has transformed how we interact with our customers. The platform''s flexibility allowed us to maintain our brand identity while dramatically improving the booking experience. Our customers love it, and our operations team can finally focus on service quality instead of managing scheduling chaos.',
  'Erik Lindqvist',
  'Chief Operations Officer, Nordic Fleet Solutions',
  '[{"icon": "Smile", "metric": "47%", "description": "Increase in customer satisfaction (NPS)"}, {"icon": "Users", "metric": "89%", "description": "Reduction in scheduling conflicts"}, {"icon": "Calendar", "metric": "3%", "description": "No-show rate (down from 12%)"}]'::jsonb,
  'Ready to transform your customer experience?',
  'See how Navio can help your business achieve similar results.',
  'Book a Demo',
  '/contact'
);