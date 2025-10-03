-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price text NOT NULL,
  period text DEFAULT '/month',
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  popular boolean NOT NULL DEFAULT false,
  cta_text text NOT NULL DEFAULT 'Get Started',
  cta_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pricing plans are viewable by everyone" 
ON public.pricing_plans 
FOR SELECT 
USING (active = true);

CREATE POLICY "Pricing plans can be managed by authenticated users" 
ON public.pricing_plans 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pricing_plans_updated_at
BEFORE UPDATE ON public.pricing_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, price, period, description, features, popular, sort_order) VALUES
('Starter', '$29', '/month', 'Perfect for individuals getting started', 
 '["Up to 10 projects", "Basic analytics", "Email support", "1GB storage"]'::jsonb, 
 false, 1),
('Professional', '$79', '/month', 'Best for growing businesses', 
 '["Unlimited projects", "Advanced analytics", "Priority support", "10GB storage", "Custom integrations", "API access"]'::jsonb, 
 true, 2),
('Enterprise', 'Custom', '', 'For large organizations', 
 '["Everything in Professional", "Dedicated account manager", "Custom contract", "Unlimited storage", "SLA guarantee", "Advanced security"]'::jsonb, 
 false, 3);