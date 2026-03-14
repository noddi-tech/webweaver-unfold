

# Fix Monthly Cost in Accept-Offer Slack Notification

## Problem

The `accept-offer` Slack notification shows "2 404,348 NOK" instead of the correct "22 120 kr". Three bugs:

1. **No currency conversion** — `total_monthly_estimate` is stored in EUR base, but the Slack message labels it "NOK" without multiplying by the conversion rate (11.5)
2. **Wrong calculation** — Instead of using the pre-calculated `total_monthly_estimate` (which includes discounts), it manually recalculates and gets it wrong
3. **No proper formatting** — Uses raw `toLocaleString("nb-NO")` + hardcoded "NOK" instead of `Intl.NumberFormat` with the offer's actual currency

## Fix

In `supabase/functions/accept-offer/index.ts`, replicate the same pattern used in `send-pricing-offer`:

1. Read `offer.currency`, `offer.conversion_rate`, and `offer.total_monthly_estimate` from the DB row
2. Compute `displayTotalMonthly = total_monthly_estimate * conversionRate` (with fallback calculation)
3. Format using `Intl.NumberFormat` with the offer's currency and locale
4. Display the correctly converted and formatted amount in the Slack message

## Files Changed
- `supabase/functions/accept-offer/index.ts` — fix monthly cost calculation and currency formatting in the Slack block

