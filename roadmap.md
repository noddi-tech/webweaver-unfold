# Roadmap

## OpenPanel telemetry (in progress)
- [x] Store OpenPanel credentials as Supabase secrets (client id/secret, project, API url)
- [x] `analytics-ingest` edge function proxying to OpenPanel
- [x] Browser analytics client (queue, device id, flush on timer/unload)
- [x] AnalyticsProvider: page views, CTA clicks, form submits, Supabase auth identify
- [x] Mirror investor portal events to OpenPanel
- [x] Wire provider into App.tsx
- [x] Deploy + send verification test events
- [x] Endpoint switched to https://analytics.naviosolutions.com/api
- [ ] BLOCKED: install `@noddi-tech/observability` from GCP Artifact Registry — needs workspace Build Secret + registry host/scope from user (support-hub setup as reference)
