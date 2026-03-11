

# Improve Tier Card Visual Hierarchy on Offer Page

## Problem
The "Du" badge and savings label are too subtle — small badge in the corner, savings text blends in. The non-selected card looks identical in prominence to the selected one.

## Solution

### 1. Grey out the non-selected card
- Add an `isGreyedOut?: boolean` prop to both `LaunchTierCard` and `ScaleTierCard`
- When greyed out: reduce opacity (`opacity-60`), use `border-muted` instead of colored border, no hover effects
- Pass `isGreyedOut={offer.tier !== 'launch'}` to LaunchTierCard and vice versa in OfferView

### 2. Move savings banner ABOVE the card (outside the card)
- Instead of showing "Du" badge + savings inside the card header, render a prominent banner **above** the selected card in `OfferView.tsx`
- Banner: full-width green/primary background strip with `CheckCircle` icon + "Valgt modell — Du sparer X kr/mnd" in bold white text
- Remove `isCustomerTier`/`savingsLabel` rendering from inside the card components (keep props for other use cases, but in OfferView use the external banner instead)

### 3. Implementation

**`OfferView.tsx`** (~lines 497-511): Wrap each card in a div. Above the selected card, render the savings banner:
```
<div className="space-y-2">
  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-semibold">
    <CheckCircle /> Valgt modell · Du sparer {savingsLabel}
  </div>
  <ScaleTierCard ... />
</div>
```

**`LaunchTierCard.tsx`** + **`ScaleTierCard.tsx`**: Add `isGreyedOut` prop. When true, apply `opacity-50 border-muted` and remove colored border styling.

## Files Changed
- `src/components/pricing/LaunchTierCard.tsx` — add `isGreyedOut` prop
- `src/components/pricing/ScaleTierCard.tsx` — add `isGreyedOut` prop  
- `src/pages/OfferView.tsx` — add external savings banner above selected card, pass `isGreyedOut` to non-selected card

