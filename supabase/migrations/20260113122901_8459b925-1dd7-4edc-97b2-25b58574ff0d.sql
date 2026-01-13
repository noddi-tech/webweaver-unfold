-- =============================================
-- PRICING OFFERS TABLE - Store generated offers
-- =============================================
CREATE TABLE public.pricing_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_company TEXT,
  customer_phone TEXT,
  
  -- Pricing details
  tier TEXT NOT NULL CHECK (tier IN ('launch', 'scale')),
  annual_revenue NUMERIC(15,2),
  locations INTEGER DEFAULT 1,
  fixed_monthly NUMERIC(10,2) NOT NULL,
  revenue_percentage NUMERIC(5,4) NOT NULL,
  per_location_cost NUMERIC(10,2),
  
  -- Discount
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  discount_reason TEXT,
  
  -- Calculated totals
  total_monthly_estimate NUMERIC(12,2),
  total_yearly_estimate NUMERIC(14,2),
  
  -- Offer metadata
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  internal_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  lead_id UUID,
  offer_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Enable RLS
ALTER TABLE public.pricing_offers ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins/editors can manage offers
CREATE POLICY "Admins can manage offers" 
ON public.pricing_offers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- Public can view their own offer via token (for email links)
CREATE POLICY "Anyone can view offer by token" 
ON public.pricing_offers 
FOR SELECT 
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_pricing_offers_updated_at
BEFORE UPDATE ON public.pricing_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- LEADS TABLE - Simple CRM for tracking prospects
-- =============================================
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact info
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Business info
  industry TEXT,
  estimated_revenue NUMERIC(15,2),
  estimated_locations INTEGER,
  
  -- Pipeline
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'meeting_scheduled', 'meeting_done', 'offer_sent', 'negotiating', 'won', 'lost', 'on_hold')),
  source TEXT,
  source_detail TEXT,
  
  -- Notes and tracking
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins/editors can manage leads
CREATE POLICY "Admins can manage leads" 
ON public.leads 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key from offers to leads
ALTER TABLE public.pricing_offers
ADD CONSTRAINT pricing_offers_lead_id_fkey
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

-- =============================================
-- LEAD ACTIVITIES TABLE - Track interactions
-- =============================================
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'email', 'call', 'meeting', 'offer_sent', 'status_change', 'other')),
  description TEXT,
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage lead activities" 
ON public.lead_activities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- Index for faster lead activity queries
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_pricing_offers_lead_id ON public.pricing_offers(lead_id);
CREATE INDEX idx_pricing_offers_status ON public.pricing_offers(status);
CREATE INDEX idx_leads_status ON public.leads(status);