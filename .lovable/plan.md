

# Offer Page: Detailed Cost Breakdown, Tier Comparison & Scale Table

## What We're Building

Three enhancements to the customer-facing offer page:

### 1. Detailed Cost Breakdown with Discount Math

Replace the current simple metrics grid with a transparent calculation that shows the customer exactly how the discount applies to each component:

**Fixed monthly breakdown:**
- Base platform fee: €1,000 (formatCurrency)
- Per-location fee: €100 × 10 locations = €1,000
- Subtotal: €2,000/mnd
- After 20% discount: **€1,600/mnd**

**Take rate breakdown:**
- Base take rate: 1.5%
- After 20% discount: **1.2%**
- Revenue cost: €12M × 1.2% / 12 = €12,000/mnd

This makes it easy for customers to self-calculate for different revenue scenarios.

### 2. Launch vs Scale Tier Cards

Import and render the existing `LaunchTierCard` and `ScaleTierCard` components below the plan details. Highlight which plan was selected (Scale) by marking it as `isSelected`. For the public offer page, `showDetailedRates` will be `false` on ScaleTierCard (keeping rates behind a meeting). Add a small heading like "Valgt prismodell" and a note explaining why Scale was recommended (e.g., cheaper for multi-location).

We'll use the default `LAUNCH_CONFIG` and `SCALE_CONFIG` from `newPricing.ts` since the offer page doesn't need DB-driven config for the comparison cards -- they're illustrative.

### 3. Scale Tier Table with "Next Level" Highlight

Import the existing `ScaleTierTable` component and render it below the tier cards (only for Scale offers). Use `detectScaleTier` from the calculator to find the customer's current tier based on their `annual_revenue`, then pass `currentTier` to highlight it. Add a note above like "Din omsetning plasserer deg i tier X. Ved høyere omsetning får du lavere rate."

This needs wrapping in a `CurrencyProvider` since `ScaleTierTable` and the tier cards use `useCurrency()`.

## Technical Details

### File: `src/pages/OfferView.tsx`

**Imports to add:**
- `LaunchTierCard` from `@/components/pricing/LaunchTierCard`
- `ScaleTierCard` from `@/components/pricing/ScaleTierCard`
- `ScaleTierTable` from `@/components/pricing/ScaleTierTable`
- `detectScaleTier` from `@/utils/newPricingCalculator`
- `generateScaleTiers`, `LAUNCH_CONFIG`, `SCALE_CONFIG` from `@/config/newPricing`
- `CurrencyProvider` from `@/contexts/CurrencyContext`

**Metrics grid (lines 338-370) -- replace with detailed breakdown:**

Show two sub-sections:
1. **Fast kostnad** -- itemized: base fee + per-location × count = subtotal, then discount applied
2. **Omsetningsbasert kostnad** -- base rate, discounted rate, monthly revenue cost

Use the existing offer fields: `fixed_monthly` stores the total fixed (base + locations), `per_location_cost` and `locations` give the breakdown. The discounted take rate = `revenue_percentage * (1 - discount_percentage/100)`.

**After the Notes card (line 432) -- add tier comparison and scale table:**

Wrap in `CurrencyProvider` with the current display currency. Render:
1. Section heading "Prismodeller"
2. Two-column grid with `LaunchTierCard` and `ScaleTierCard`, with the offer's tier marked `isSelected`
3. If Scale tier: `ScaleTierTable` with `currentTier` highlighted, plus a motivational note about the next tier

**Calculations needed:**
```
const scaleTiers = generateScaleTiers();
const { tier: currentTierNumber } = detectScaleTier(offer.annual_revenue, scaleTiers);
const baseTakeRate = offer.revenue_percentage; // before discount
const discountedTakeRate = baseTakeRate * (1 - (offer.discount_percentage || 0) / 100);
const baseFixed = offer.fixed_monthly - (offer.per_location_cost || 0) * (offer.locations || 1);
// or simpler: if per_location_cost exists, show it; otherwise just show fixed_monthly as-is
```

### No other files changed

The `LaunchTierCard`, `ScaleTierCard`, `ScaleTierTable`, and calculator utilities already exist and are production-ready.

