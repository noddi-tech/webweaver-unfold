-- Create rotating_headline_terms table
CREATE TABLE rotating_headline_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term_key TEXT NOT NULL,
  descriptor_key TEXT NOT NULL,
  term_fallback TEXT NOT NULL,
  descriptor_fallback TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Sparkles',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE rotating_headline_terms ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Rotating headline terms viewable by everyone" 
ON rotating_headline_terms FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Rotating headline terms manageable by authenticated users" 
ON rotating_headline_terms FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_rotating_headline_terms_updated_at
BEFORE UPDATE ON rotating_headline_terms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data with translation keys
INSERT INTO rotating_headline_terms (term_key, descriptor_key, term_fallback, descriptor_fallback, sort_order) VALUES
('hero.rotating.erp.term', 'hero.rotating.erp.desc', 'ERP', 'One platform for capacity, routing, bay scheduling, billing and data.', 1),
('hero.rotating.booking.term', 'hero.rotating.booking.desc', 'Online booking', 'Real-time availability, instant confirmation, self-serve changes and cancellations.', 2),
('hero.rotating.route.term', 'hero.rotating.route.desc', 'Route planner', 'Multi-stop planning with live resequencing and accurate ETAs.', 3),
('hero.rotating.capacity.term', 'hero.rotating.capacity.desc', 'Capacity engine', 'Opens, protects and fills the right slots automatically.', 4),
('hero.rotating.workshop.term', 'hero.rotating.workshop.desc', 'Workshop scheduler', 'Matches bays, lifts, parts and technicians—on time.', 5),
('hero.rotating.crm.term', 'hero.rotating.crm.desc', 'CRM', 'Customer history, messaging and approvals in one place.', 6),
('hero.rotating.portal.term', 'hero.rotating.portal.desc', 'Customer portal', 'Book, change, cancel and view inspections and payments.', 7),
('hero.rotating.automation.term', 'hero.rotating.automation.desc', 'Automation', 'Triggers that act before people need to.', 8),
('hero.rotating.analytics.term', 'hero.rotating.analytics.desc', 'Analytics', 'Live dashboards for utilization, on-time arrivals, revenue and margin.', 9),
('hero.rotating.payments.term', 'hero.rotating.payments.desc', 'Payments', 'Quote to invoice with integrated, secure payments.', 10);

-- Seed English translations for all terms
INSERT INTO translations (translation_key, language_code, translated_text, approved, context, page_location) VALUES
-- Term translations
('hero.rotating.erp.term', 'en', 'ERP', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.booking.term', 'en', 'Online booking', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.route.term', 'en', 'Route planner', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.capacity.term', 'en', 'Capacity engine', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.workshop.term', 'en', 'Workshop scheduler', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.crm.term', 'en', 'CRM', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.portal.term', 'en', 'Customer portal', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.automation.term', 'en', 'Automation', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.analytics.term', 'en', 'Analytics', true, 'Hero rotating headline - term', 'homepage'),
('hero.rotating.payments.term', 'en', 'Payments', true, 'Hero rotating headline - term', 'homepage'),
-- Descriptor translations
('hero.rotating.erp.desc', 'en', 'One platform for capacity, routing, bay scheduling, billing and data.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.booking.desc', 'en', 'Real-time availability, instant confirmation, self-serve changes and cancellations.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.route.desc', 'en', 'Multi-stop planning with live resequencing and accurate ETAs.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.capacity.desc', 'en', 'Opens, protects and fills the right slots automatically.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.workshop.desc', 'en', 'Matches bays, lifts, parts and technicians—on time.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.crm.desc', 'en', 'Customer history, messaging and approvals in one place.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.portal.desc', 'en', 'Book, change, cancel and view inspections and payments.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.automation.desc', 'en', 'Triggers that act before people need to.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.analytics.desc', 'en', 'Live dashboards for utilization, on-time arrivals, revenue and margin.', true, 'Hero rotating headline - descriptor', 'homepage'),
('hero.rotating.payments.desc', 'en', 'Quote to invoice with integrated, secure payments.', true, 'Hero rotating headline - descriptor', 'homepage')
ON CONFLICT (translation_key, language_code) DO NOTHING;