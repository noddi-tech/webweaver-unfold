

# Fix accept-offer Edge Function — Wrong Column Name

## Root Cause
The `accept-offer` edge function queries the `pricing_offers` table using `.eq("token", offer_token)`, but the column is actually named `offer_token`, not `token`. This causes "Offer not found" for every acceptance attempt.

## Fix

**File: `supabase/functions/accept-offer/index.ts`** — Change line 27:
```diff
- .eq("token", offer_token)
+ .eq("offer_token", offer_token)
```

That's it. One line fix. After this, the accept flow will work and trigger:
1. Offer status updated to "accepted" with `accepted_at` timestamp
2. Linked lead status updated to "won"
3. Slack notification sent with offer details

