

# Global Color System Update — New Purple Palette

## Summary

Update the entire site's color system with new tokens: **Secondary (#5B4ACF)**, **Card Surface (#EEEAFC)**, **Card Surface Text (#3D2E99)**, and a **three-stop purple gradient**. Apply these to specific components and the CMS database.

## New Tokens (HSL conversions)

| Name | Hex | HSL |
|---|---|---|
| Secondary | #5B4ACF | `250 57% 55%` |
| Card Surface | #EEEAFC | `258 72% 95%` |
| Card Surface Text | #3D2E99 | `250 54% 39%` |
| Gradient (new) | #5B4ACF → #3D2E99 → #201466 | 3-stop 135deg |

## Files to Change

### 1. `src/index.css` — CSS Variables
- Update `--secondary` from `210 40% 96.1%` → `250 57% 55%`
- Update `--secondary-foreground` → `0 0% 100%` (white text on vivid purple)
- Add `--card-surface: 258 72% 95%`
- Add `--card-surface-foreground: 250 54% 39%`
- Update `--text-link-hover` → `250 57% 55%` (hover = vivid purple)
- Add `--gradient-purple-depth: linear-gradient(135deg, hsl(250 57% 55%) 0%, hsl(250 54% 39%) 50%, hsl(249 67% 24%) 100%)`

### 2. `tailwind.config.ts` — Tailwind Tokens
- Add `'card-surface'` and `'card-surface-foreground'` color mappings
- Add `'gradient-purple-depth'` to `backgroundImage`

### 3. `src/components/WhyNavio.tsx` — Comparison Section
- "With Navio" card: change `defaultBackground` to use card-surface lavender (`#EEEAFC`), heading text `#3D2E99`, border `2px solid #5B4ACF`. Keep green checkmarks.
- "Without Navio" card: keep muted, no colored border.
- VS badge: change `bg-primary` → `bg-secondary` (now vivid purple) with white text.

### 4. `src/components/IntegrationStrip.tsx`
- Section background: change `defaultBackground` from `"bg-muted/50"` to card-surface lavender.
- Tech badges: background `#EEEAFC`, text `#3D2E99`, border `rgba(91,74,207,0.15)`.
- Eontyre pill: add `border: 1px solid rgba(91,74,207,0.15)`.
- Navio SVG box: replace `--gradient-warmth` with the new `--gradient-purple-depth`.

### 5. `src/components/HowItWorks.tsx` — Step Number Badges
- Desktop & mobile number circles: change from `bg-background border border-primary/20` with `bg-primary/10` overlay and `text-primary` → solid `bg-secondary` (vivid purple) background with white text. Remove the overlay div.

### 6. `src/components/ScrollingFeatureCards.tsx` — Step Number Badges
- Both mobile (~line 818) and desktop (~line 987) Badge styles: change from `rgba(120, 86, 255, 0.1)` background to solid `#5B4ACF` with white text.

### 7. Database — CMS `color_tokens` table
- Insert new tokens via SQL migration:
  - `--card-surface` (solid, category: surfaces, value: `258 72% 95%`, preview_class: `bg-card-surface`, optimal_text_color: `dark`)
  - `--card-surface-foreground` (solid, category: text, value: `250 54% 39%`)
  - `--gradient-purple-depth` (gradient, category: gradients, value: the 3-stop gradient, preview_class: `bg-gradient-purple-depth`, optimal_text_color: `white`)
  - Update existing `--secondary` token value to `250 57% 55%`

### Colors NOT Changed
- `#201466` primary CTA — unchanged
- Coral/salmon gradient on feature screenshots — unchanged
- Hero gradient — unchanged
- Final CTA section purple — unchanged (could optionally use new gradient)
- White card backgrounds — unchanged

