

# Offer Page UI/UX Redesign

## Current State
The offer page shows pricing details in a flat, minimal layout. The discount badge is small and easy to miss. There's no breakdown showing price before/after discount, no yearly cost summary, and the financial metrics lack visual hierarchy and icons.

## Redesigned Plan Details Card

Replace the current simple 2-column grid + estimate box with a richer, icon-driven layout:

### 1. Prominent Discount Banner (when discount > 0)
Instead of a small badge next to the plan title, show a highlighted banner strip across the top of the plan card with a `Tag`/`Percent` icon and large text like "20% rabatt på dette tilbudet".

### 2. Icon-Enhanced Metrics Grid
Replace the plain `bg-muted/50` boxes with a 2x2 (or 3-column) grid of metric cards, each with a distinct icon:

| Metric | Icon | Content |
|--------|------|---------|
| Årlig omsetning | `TrendingUp` | Annual revenue amount |
| Fast månedlig avgift | `Wallet` | Fixed monthly fee |
| Omsetningsandel | `Percent` | Revenue percentage |
| Lokasjoner | `Building2` | Number of locations (if Scale) |

### 3. Discount Breakdown Section (when discount > 0)
Show a clear before/after comparison:
- **Pris før rabatt**: `totalMonthlyBeforeDiscount` with strikethrough styling
- **Din rabatt**: `-X%` in green with `Tag` icon
- **Din pris**: `totalMonthly` in large bold primary color

### 4. Cost Summary Box
Enhanced estimate box at the bottom showing:
- **Estimert månedlig kostnad**: large primary-colored amount
- **Estimert årlig kostnad**: `totalMonthly * 12` with `CalendarDays` icon
- **Effektiv rate**: percentage with `Gauge` icon
- Based-on note with the annual revenue reference

### 5. Accept Dialog Enhancement
Update the accept confirmation dialog to also show the discount and final price clearly.

## Files Changed
- `src/pages/OfferView.tsx` — Restructure the Plan Details card (lines ~319-363) with the new layout, add icons, discount breakdown, and yearly cost. Update the accept dialog summary (~561-575).

## No Breaking Changes
- All existing data fields (`offer.fixed_monthly`, `offer.revenue_percentage`, `offer.discount_percentage`, `offer.total_monthly_estimate`, `offer.annual_revenue`, `offer.locations`) are read-only — no data model changes.
- Currency conversion, PDF generation, accept/question flows, sales contacts section all remain untouched.
- The `formatCurrency` helper is reused as-is.

