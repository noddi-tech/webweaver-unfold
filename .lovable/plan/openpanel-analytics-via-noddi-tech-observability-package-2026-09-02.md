# OpenPanel analytics via @noddi-tech observability package

Ship product analytics from the Navio site to OpenPanel at `https://analytics.noddi.co/api`, project `navio-tech`, with the client secret kept server-side.

## What you need to do first (blocks install)

The observability package is in a private Google Artifact Registry, which needs a workspace-level Build Secret I cannot create.

1. Workspace Settings → Build Secrets → add your Artifact Registry npm token (suggested name: `GAR_NPM_TOKEN`).
2. Reply with: the registry host (e.g. `europe-north1-npm.pkg.dev/<gcp-project>/<repo>`), the npm scope (e.g. `@noddi-tech`), the exact package name, and the secret name you used.

I will then add a `.npmrc` mapping that scope to the registry with `_authToken=${GAR_NPM_TOKEN}` and install the package. If the install fails on auth, I fall back to a thin in-repo OpenPanel client with the same public API so nothing else in the plan changes.

## How it works

```text
Browser (client_id only, no secret)
  └─ analytics.track(...) / identify(...)
        └─ POST /functions/v1/analytics-ingest   (Supabase edge function)
              └─ POST https://analytics.noddi.co/api/track
                 headers: openpanel-client-id + openpanel-client-secret
```

The client secret is stored as a Supabase secret and only read inside the edge function, so it never enters the browser bundle.

## Build steps

1. **Secrets** — store `OPENPANEL_CLIENT_SECRET` (`sec_f83ff…`) via the secret tool. `OPENPANEL_CLIENT_ID` and project `navio-tech` are non-secret config in the function.
2. **Edge function `analytics-ingest`** — CORS, validates a batch of events (type, name, properties, profileId, max 100 per batch), forwards to the OpenPanel `/track` endpoint with the client id/secret headers, returns per-event results. No JWT required (public site traffic).
3. **Analytics provider (`src/analytics/`)** — a provider mounted in `App.tsx` that:
   - keeps a persistent anonymous device id in localStorage,
   - queues events and flushes on a 5s timer, on `visibilitychange`, and on unload (keepalive fetch),
   - exposes `track`, `identify`, `setProperties` through a `useAnalytics()` hook.
4. **Identity** — `identify()` fires when a Supabase auth session exists (user id, email, role) and when an investor portal session exists (investor email, session id). Sign-out clears the profile back to anonymous.
5. **Auto page views** — route-change listener sends `screen_view` with path, language prefix, referrer, and title on every navigation, including `/:lang` routes.
6. **CTA + form events** — `cta_click` on primary CTA/demo/contact/pricing buttons, and `form_submit` on contact, newsletter, job application and booking submissions (name + outcome, no field contents).
7. **Investor portal mirror** — the existing `InvestorTrackingContext` events (slide_view, slide_exit, pdf_export, pledge_submitted, nda_accepted, tab_view) are additionally forwarded to OpenPanel, keeping the current Supabase tracking untouched.
8. **Verification** — I send a labelled set of test events (`test_ping`, a `screen_view`, a `cta_click`, an `identify`) from the deployed function and report the API responses so you can confirm them in OpenPanel.

## Notes

- No database changes; OpenPanel is the sink.
- PII sent is limited to the authenticated/investor email already known to those systems.
- If you would rather not send email at all, say so and I'll hash it before sending.
