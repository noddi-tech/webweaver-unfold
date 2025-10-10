-- Add Architecture Diagram and Partners ProofMetrics English translation keys
INSERT INTO public.translations (translation_key, language_code, translated_text, approved, page_location) VALUES
-- Architecture Diagram
('architecture.diagram.title', 'en', 'The Stack', true, 'architecture'),
('architecture.diagram.subtitle', 'en', 'A unified architecture. Everything shares the same data model.', true, 'architecture'),
('architecture.diagram.layer_1.title', 'en', 'Frontend', true, 'architecture'),
('architecture.diagram.layer_1.subtitle', 'en', 'Booking + Admin UI', true, 'architecture'),
('architecture.diagram.layer_2.title', 'en', 'Unified API Layer', true, 'architecture'),
('architecture.diagram.layer_2.subtitle', 'en', 'Single source of truth', true, 'architecture'),
('architecture.diagram.layer_3.title', 'en', 'Backend Services', true, 'architecture'),
('architecture.diagram.layer_3.subtitle', 'en', 'Booking, Capacity, Recall, Analytics', true, 'architecture'),
('architecture.diagram.layer_4.title', 'en', 'External Integrations', true, 'architecture'),
('architecture.diagram.layer_4.subtitle', 'en', 'Tire DBs, Scanners, Payments, ERP', true, 'architecture'),
('architecture.diagram.footer_text', 'en', 'No integrations to chase. No sync jobs to fix. Just one living system.', true, 'architecture'),

-- Partners ProofMetrics
('proof_metrics.title', 'en', 'Real Numbers. Real Results.', true, 'partners'),
('proof_metrics.subtitle', 'en', 'Noddi powers operations across Europe with proven performance.', true, 'partners'),
('proof_metrics.metric_1.headline', 'en', '~90 NPS.', true, 'partners'),
('proof_metrics.metric_1.context', 'en', 'Three times the industry average.', true, 'partners'),
('proof_metrics.metric_1.comparison', 'en', 'vs. 20-30 industry standard', true, 'partners'),
('proof_metrics.metric_2.headline', 'en', '20,000+ bookings.', true, 'partners'),
('proof_metrics.metric_2.context', 'en', 'Zero sync issues.', true, 'partners'),
('proof_metrics.metric_2.comparison', 'en', 'And growing', true, 'partners'),
('proof_metrics.metric_3.headline', 'en', '4 SaaS partners.', true, 'partners'),
('proof_metrics.metric_3.context', 'en', '1 shared platform.', true, 'partners'),
('proof_metrics.metric_3.comparison', 'en', 'Active paying customers', true, 'partners'),
('proof_metrics.metric_4.headline', 'en', '>49% market growth YoY.', true, 'partners'),
('proof_metrics.metric_4.context', 'en', 'In convenience services.', true, 'partners'),
('proof_metrics.metric_4.comparison', 'en', 'Convenience services sector', true, 'partners'),
('proof_metrics.metric_5.headline', 'en', '€65B addressable market.', true, 'partners'),
('proof_metrics.metric_5.context', 'en', 'Global automotive services.', true, 'partners'),
('proof_metrics.metric_5.comparison', 'en', 'Ready to scale', true, 'partners'),
('proof_metrics.metric_6.headline', 'en', 'Performance-based model.', true, 'partners'),
('proof_metrics.metric_6.context', 'en', 'We grow when you grow.', true, 'partners'),
('proof_metrics.metric_6.comparison', 'en', 'Pure SaaS pricing', true, 'partners')

ON CONFLICT (translation_key, language_code) DO NOTHING;