

# Fix "undefined" in Slack Notifications + Allow Deleting Accepted Offers

## Issue 1: Slack shows "undefined"

The `accept-offer` edge function references column names that don't exist in the `pricing_offers` table:

| Code references | Actual DB column |
|---|---|
| `offer.company_name` | `offer.customer_company` |
| `offer.contact_name` | `offer.customer_name` |
| `offer.contact_email` | `offer.customer_email` |
| `offer.locations_included` | `offer.locations` |
| `offer.fixed_monthly_cost` | `offer.fixed_monthly` |
| `offer.estimated_monthly_revenue` | `offer.annual_revenue` |

Every field in the Slack message resolves to `undefined` because the property names are wrong.

**Fix in `supabase/functions/accept-offer/index.ts`**: Replace all incorrect column references with the actual DB column names throughout the Slack notification block (lines 93-137). Also fix the monthly cost calculation to use `fixed_monthly` and `annual_revenue`.

## Issue 2: Can't delete accepted offers

In `src/components/pricing/OffersHistory.tsx`, the `canDelete` function only allows `draft` and `sent`:
```ts
const canDelete = (status) => !status || ['draft', 'sent'].includes(status);
```

**Fix**: Add `'accepted'` to the allowed statuses (or remove the restriction entirely for admin flexibility).

## Files Changed
- `supabase/functions/accept-offer/index.ts` — fix all column name references
- `src/components/pricing/OffersHistory.tsx` — allow deleting accepted offers

