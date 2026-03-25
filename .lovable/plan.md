

# Add Eyebrow Labels to All Homepage Sections (except Hero)

## What
Add an uppercase eyebrow label (like "INTEGRATIONS" on IntegrationStrip) above the heading of each homepage section. This creates visual consistency and helps users scan the page.

## Sections to update

| Section | Component | Eyebrow text | Translation key |
|---|---|---|---|
| ScrollingFeatureCards | `ScrollingFeatureCards.tsx` | "FEATURES" | `scrolling_features.eyebrow` |
| WhyNavio | `WhyNavio.tsx` | "WHY NAVIO" | `why_noddi.eyebrow` |
| HowItWorks | `HowItWorks.tsx` | "HOW IT WORKS" | `how_it_works.eyebrow` |
| CustomerTestimonial | `CustomerTestimonial.tsx` | "TESTIMONIAL" | `testimonial.eyebrow` |
| FinalCTA | `FinalCTA.tsx` | "GET STARTED" | `final_cta.eyebrow` |

**Already has eyebrow:** IntegrationStrip (no change needed)
**Excluded:** Hero, LogoMarquee

## Pattern
Reuse the exact same markup from IntegrationStrip:

```tsx
<EditableTranslation translationKey="[section].eyebrow" onSave={onSave}>
  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {t("[section].eyebrow", "LABEL TEXT")}
  </span>
</EditableTranslation>
```

Place it as the first child inside the section header `div`, above the `<h2>`.

## Notes
- For ScrollingFeatureCards, add to both the desktop sidebar heading area and the tablet/mobile heading block (line ~755)
- For CustomerTestimonial, place above the quote icon
- For FinalCTA, adapt color to match the dark/gradient background (use the existing `ctaData.footerColor` or similar light color token)
- All eyebrow text is CMS-editable via `EditableTranslation`

## Files

| File | Change |
|---|---|
| `src/components/ScrollingFeatureCards.tsx` | Add eyebrow above heading in sidebar + mobile header |
| `src/components/WhyNavio.tsx` | Add eyebrow above h2 |
| `src/components/HowItWorks.tsx` | Add eyebrow above h2 |
| `src/components/CustomerTestimonial.tsx` | Add eyebrow above quote icon |
| `src/components/FinalCTA.tsx` | Add eyebrow above title |

