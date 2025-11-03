-- Create FAQs table
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  type text NOT NULL CHECK (type IN ('general', 'features', 'pricing')),
  active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "FAQs are viewable by everyone"
  ON public.faqs
  FOR SELECT
  USING (active = true);

CREATE POLICY "FAQs can be managed by authenticated users"
  ON public.faqs
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert pricing FAQs
INSERT INTO public.faqs (question, answer, type, sort_order) VALUES
  ('Is there a free tier?', 'No. Billing starts from your first euro of revenue. We believe in transparent, performance-based pricing that scales with your success—no free tier games, just fair pricing from day one.', 'pricing', 1),
  ('Why revenue-based pricing?', 'Revenue-based pricing ensures you pay in proportion to the value you get from our platform. When you grow, we grow together. This alignment of incentives means we''re always working to help you succeed.', 'pricing', 2),
  ('How are rates calculated?', 'Rates are calculated using a single-tier flat-rate system based on your monthly SaaS revenue. There are no complex tiers or sudden jumps—just straightforward percentage-based pricing that scales smoothly with your business.', 'pricing', 3),
  ('Do you offer discounts?', 'Yes! We offer two types of contract discounts: a 3% discount for 6-month pre-payment contracts, and a 5% discount for annual contracts. These discounts provide significant savings while giving you budget predictability.', 'pricing', 4),
  ('Is there a minimum commitment?', 'No minimum commitment is required for the standard pay-as-you-go model. However, if you opt for a contract with pre-payment, you''ll benefit from our discount rates while locking in predictable costs.', 'pricing', 5),
  ('What happens if my revenue changes?', 'Your pricing automatically adjusts as your revenue changes. The rate you pay stays consistent, so your costs scale proportionally with your growth—no surprises, no manual adjustments needed.', 'pricing', 6),
  ('Are there any hidden fees?', 'No hidden fees whatsoever. The usage fee includes everything: unlimited users, all features, updates, and support. What you see is what you pay—simple and transparent.', 'pricing', 7);