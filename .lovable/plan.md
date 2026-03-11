

# Add "You" Badge + Savings to Tier Cards on Offer Page

## What We're Building

Add a "You" badge and savings calculation to the `LaunchTierCard` and `ScaleTierCard` on the offer page, similar to how the ScaleTierTable already marks the customer's current tier with a "You" badge.

## Approach

### 1. Add optional props to both tier card components

**`LaunchTierCard`** and **`ScaleTierCard`** -- add two new optional props:
- `savingsLabel?: string` -- e.g. "Du sparer 4 200 kr/mnd" or null
- `isCustomerTier?: boolean` -- when true, show a "You" badge next to the plan name

### 2. Calculate savings in `OfferView.tsx`

Use `comparePricing` (already exists in calculator) to compute Launch vs Scale yearly cost for the customer's revenue and location count. Then derive the monthly savings for the cheaper tier:

```typescript
const comparison = comparePricing(offer.annual_revenue, locationCount);
const monthlySavings = comparison.savingsAmount / 12;
```

Pass `isCustomerTier={true}` and `savingsLabel={formatCurrency(monthlySavings) + '/mnd'}` to the selected tier card.

### 3. Visual treatment

On the selected card, render a small green `Badge` below the title: **"Din plan · Du sparer X kr/mnd"** with a checkmark icon. Keep it subtle but visible -- similar to how the ScaleTierTable uses `<Badge variant="default">You</Badge>`.

## Files Changed

- **`src/components/pricing/LaunchTierCard.tsx`** -- Add `isCustomerTier` and `savingsLabel` props. When `isCustomerTier`, show a "You" badge next to title and a savings note.
- **`src/components/pricing/ScaleTierCard.tsx`** -- Same: add `isCustomerTier` and `savingsLabel` props with badge rendering.
- **`src/pages/OfferView.tsx`** -- Import `comparePricing`, calculate savings, pass new props to the tier cards (~lines 492-502).

