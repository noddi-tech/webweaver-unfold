# Tech debt — Navio Solutions website

Tracked items to clean up in dedicated future sessions, separate from feature work.

## Database

- **`uuid-ossp` extension installed but unused on remote.** Drop in a separate cleanup task. Verify with:

  ```sql
  SELECT count(*) FROM pg_proc
  WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'extensions')
    AND proname LIKE 'uuid_generate%';
  ```

  Confirm there are 0 references in our codebase before drop. Schema uses `pgcrypto.gen_random_uuid()` exclusively for UUID generation.

- **Two malformed migration files left in place:** `supabase/migrations/20250813073911-.sql` and `supabase/migrations/20250813080032-.sql`. These don't match the `<timestamp>_<name>.sql` pattern so the Supabase CLI skips them with warnings. Their DDL is captured in the squash baseline `20260428000000_squash_baseline.sql` but the files themselves should be removed in a separate cleanup commit (separate so the migration squash commit stays scoped to its purpose).

## Edge Functions

- **18 Edge Functions on disk are not declared in `supabase/config.toml`** and inherit `verify_jwt = true` by default. Audit each — confirm whether JWT verification is desired, then declare explicitly either way:

  ```
  accept-offer
  get-member-availability
  publish-scheduled-posts
  receive-email-reply
  reschedule-booking
  resend-webhook
  send-application-confirmation
  send-application-status-update
  send-booking-link
  send-candidate-message
  send-feedback-reminder
  send-interview-invitation
  send-offer-question
  send-offer-slack-notification
  send-pricing-offer
  serve-static-file
  sync-and-translate
  track-offer-view
  ```
