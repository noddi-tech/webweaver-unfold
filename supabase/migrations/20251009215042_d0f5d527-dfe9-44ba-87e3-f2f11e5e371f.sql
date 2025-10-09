-- Phase 3: Add translation keys for WhyItMatters, ProductFeatures, ProductOverview, and ProofMetricsHomepage

-- WhyItMatters translation keys
INSERT INTO translations (translation_key, language_code, translated_text) VALUES
('why_it_matters.title', 'en', 'Why Our Integrated Platform Matters'),
('why_it_matters.subtitle', 'en', 'When your booking system and ERP speak the same language, everything just works'),
('why_it_matters.tab_problem', 'en', 'The Industry Problem'),
('why_it_matters.tab_opportunity', 'en', 'Opportunity & Traction'),
('why_it_matters.tab_advantage', 'en', 'Integrated Tech Advantage'),

-- Tab 1: The Industry Problem
('why_it_matters.problem.title', 'en', 'The Car Maintenance Experience Is Broken'),
('why_it_matters.problem.subtitle', 'en', 'Traditional automotive services are failing to meet modern customer expectations'),
('why_it_matters.problem.card_1.title', 'en', 'Inconvenient & Time-Consuming'),
('why_it_matters.problem.card_1.description', 'en', 'Customers waste hours driving to garages, waiting for service, and dealing with manual processes'),
('why_it_matters.problem.card_2.title', 'en', 'Poor Customer Experience'),
('why_it_matters.problem.card_2.description', 'en', 'Hidden fees, lack of transparency, and unreliable communication damage trust and satisfaction'),
('why_it_matters.problem.card_3.title', 'en', 'Limited Digital Presence'),
('why_it_matters.problem.card_3.description', 'en', 'Most providers aren''t digital—still relying on phone calls and manual scheduling'),
('why_it_matters.problem.card_4.title', 'en', 'Industry NPS: 20-30'),
('why_it_matters.problem.card_4.description', 'en', 'Low customer satisfaction scores indicate widespread dissatisfaction with current service models'),

-- Tab 2: Opportunity & Traction
('why_it_matters.opportunity.title', 'en', 'Convenience Services Are Exploding'),
('why_it_matters.opportunity.subtitle', 'en', 'The market is growing rapidly, and Noddi is leading the transformation'),
('why_it_matters.opportunity.metric_1.label', 'en', 'Annual Market Growth'),
('why_it_matters.opportunity.metric_1.description', 'en', 'Convenience services are the fastest-growing segment'),
('why_it_matters.opportunity.metric_2.label', 'en', 'Bookings Completed — and growing'),
('why_it_matters.opportunity.metric_2.description', 'en', 'Proven platform with real commercial traction'),
('why_it_matters.opportunity.metric_3.label', 'en', 'Customer Satisfaction'),
('why_it_matters.opportunity.metric_3.description', 'en', '3x better than industry average (20-30)'),
('why_it_matters.opportunity.metric_4.label', 'en', 'Paying SaaS Partners'),
('why_it_matters.opportunity.metric_4.description', 'en', 'Take-rate per booking model validated'),
('why_it_matters.opportunity.metric_5.label', 'en', 'Addressable Market'),
('why_it_matters.opportunity.metric_5.description', 'en', 'Massive opportunity for platform expansion'),
('why_it_matters.opportunity.metric_6.label', 'en', 'License Revenue Potential'),
('why_it_matters.opportunity.metric_6.description', 'en', 'Annual recurring revenue opportunity'),

-- Tab 3: Integrated Tech Advantage
('why_it_matters.advantage.title', 'en', 'One Platform. One Source of Truth.'),
('why_it_matters.advantage.description', 'en', 'Noddi doesn''t just provide a booking flow — we offer a fully automated logistics platform that eliminates API sync issues because the ERP backend and booking frontend share the same data model and automation engine'),
('why_it_matters.advantage.tagline', 'en', 'When your booking system and ERP speak the same language, everything just works.'),
('why_it_matters.advantage.table.problem', 'en', 'Problem'),
('why_it_matters.advantage.table.disconnected', 'en', 'What Happens in Disconnected Systems'),
('why_it_matters.advantage.table.approach', 'en', 'Noddi''s Integrated Approach'),
('why_it_matters.advantage.mobile.disconnected_label', 'en', 'Disconnected Systems:'),
('why_it_matters.advantage.mobile.approach_label', 'en', 'Noddi''s Approach:'),

-- Pain points
('why_it_matters.pain_points.tire_sales.problem', 'en', 'Tire sales can''t be automated'),
('why_it_matters.pain_points.tire_sales.disconnected', 'en', 'Manual cross-checking, delays, errors'),
('why_it_matters.pain_points.tire_sales.approach', 'en', 'Fully integrated tire sales tied to inventory & quoting'),
('why_it_matters.pain_points.recall.problem', 'en', 'Poor recall logic'),
('why_it_matters.pain_points.recall.disconnected', 'en', 'Static campaigns, low relevance'),
('why_it_matters.pain_points.recall.approach', 'en', 'Recall campaigns driven by capacity, utilization, and data'),
('why_it_matters.pain_points.sync.problem', 'en', 'Sync issues when booking changes'),
('why_it_matters.pain_points.sync.disconnected', 'en', 'Broken flows, double bookings'),
('why_it_matters.pain_points.sync.approach', 'en', 'Real-time sync across booking, backend, shop'),
('why_it_matters.pain_points.lane.problem', 'en', 'Lane optimization breaks'),
('why_it_matters.pain_points.lane.disconnected', 'en', 'Digital → analog friction upon arrival'),
('why_it_matters.pain_points.lane.approach', 'en', 'Seamless experience from booking to garage floor'),
('why_it_matters.pain_points.contactless.problem', 'en', 'Contactless visits are limited'),
('why_it_matters.pain_points.contactless.disconnected', 'en', 'Need in-person touchpoints'),
('why_it_matters.pain_points.contactless.approach', 'en', 'Fully self-servicable UI with mobile + in-lane support'),
('why_it_matters.pain_points.splitting.problem', 'en', 'Splitting across systems'),
('why_it_matters.pain_points.splitting.disconnected', 'en', 'Integration complexity + tech dependencies'),
('why_it_matters.pain_points.splitting.approach', 'en', 'We own both booking and ERP — one roadmap, one source of truth'),

-- ProductFeatures translation keys
('product_features.title', 'en', 'Product Capabilities'),
('product_features.subtitle', 'en', 'Everything you need to run your automotive service business'),
('product_features.see_more', 'en', 'See more'),

-- Booking feature
('product_features.booking.title', 'en', 'Modern Booking Experience'),
('product_features.booking.bullet_1', 'en', 'One-minute funnel: address → car → services → timeslot → confirm'),
('product_features.booking.bullet_2', 'en', 'Available on mobile and desktop'),
('product_features.booking.bullet_3', 'en', 'Multi-channel booking support'),

-- Tire sales feature
('product_features.tire_sales.title', 'en', 'Tire Sales & Inventory Integration'),
('product_features.tire_sales.bullet_1', 'en', 'Automated tire tracking with storage logistics'),
('product_features.tire_sales.bullet_2', 'en', 'Laser scanner sensor data integration'),
('product_features.tire_sales.bullet_3', 'en', 'Auto-generated quotes based on inventory & margins'),

-- Auto recall feature
('product_features.auto_recall.title', 'en', 'Auto Recall & Re-engagement'),
('product_features.auto_recall.bullet_1', 'en', 'Cohort-based recall campaigns'),
('product_features.auto_recall.bullet_2', 'en', 'Triggered by capacity and utilization data'),
('product_features.auto_recall.bullet_3', 'en', '77.9% acceptance rate'),

-- Capacity feature
('product_features.capacity.title', 'en', 'Capacity / Lane Optimization'),
('product_features.capacity.bullet_1', 'en', 'Admins set service areas and worker competencies'),
('product_features.capacity.bullet_2', 'en', 'Dynamically allocates resources to maximize utilization'),
('product_features.capacity.bullet_3', 'en', 'Avoid overbooking with smart route planning'),

-- Sync feature
('product_features.sync.title', 'en', 'Real-time Sync & Data Flow'),
('product_features.sync.bullet_1', 'en', 'No sync delays or API issues'),
('product_features.sync.bullet_2', 'en', 'Single source of truth across frontend & backend'),
('product_features.sync.bullet_3', 'en', 'Seamless integration from booking to lane'),

-- Reporting feature
('product_features.reporting.title', 'en', 'Reporting & Analytics'),
('product_features.reporting.bullet_1', 'en', 'Comprehensive dashboards'),
('product_features.reporting.bullet_2', 'en', 'Performance metrics and KPIs'),
('product_features.reporting.bullet_3', 'en', 'Business intelligence for decision-making'),

-- Workflow feature
('product_features.workflow.title', 'en', 'Workflow Automation'),
('product_features.workflow.bullet_1', 'en', 'Backend event-condition-action engine'),
('product_features.workflow.bullet_2', 'en', 'Automates service completion, storage & inventory'),
('product_features.workflow.bullet_3', 'en', 'Recall triggers without manual intervention'),

-- Fleet feature
('product_features.fleet.title', 'en', 'B2B Portal & Fleet Management'),
('product_features.fleet.bullet_1', 'en', 'Tailored portals for fleet customers'),
('product_features.fleet.bullet_2', 'en', 'Manage multiple vehicles and bookings'),
('product_features.fleet.bullet_3', 'en', 'API support for third-party fleet systems'),

-- ProductOverview translation keys
('product_overview.title', 'en', 'One platform. Every function.'),
('product_overview.subtitle', 'en', 'Explore how Noddi unifies your entire operation'),
('product_overview.functions.title', 'en', 'Functions'),
('product_overview.functions.description', 'en', 'See every capability—from booking to invoicing—in one platform'),
('product_overview.partners.title', 'en', 'Partners'),
('product_overview.partners.description', 'en', 'Built for automotive networks, tire hotels, and multi-location chains'),
('product_overview.architecture.title', 'en', 'Architecture'),
('product_overview.architecture.description', 'en', 'Understand the technology behind Noddi''s unified system'),

-- ProofMetricsHomepage translation keys
('proof_metrics.title', 'en', 'Built for production. Proven in practice.'),
('proof_metrics.subtitle', 'en', 'Numbers that matter—from real operations'),
('proof_metrics.cta', 'en', 'See Customer Stories'),
('proof_metrics.metric_1.label', 'en', 'NPS Score'),
('proof_metrics.metric_1.context', 'en', 'Industry-leading customer satisfaction'),
('proof_metrics.metric_2.label', 'en', 'Bookings Completed'),
('proof_metrics.metric_2.context', 'en', 'Proven at scale'),
('proof_metrics.metric_3.label', 'en', 'Active Locations'),
('proof_metrics.metric_3.context', 'en', 'Across Scandinavia'),
('proof_metrics.metric_4.label', 'en', 'Automation Rate'),
('proof_metrics.metric_4.context', 'en', 'Manual tasks eliminated')

ON CONFLICT (translation_key, language_code) DO NOTHING;