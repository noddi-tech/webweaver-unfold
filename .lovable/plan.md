

# New Integrations Section — CMS-Compliant

## Approach

Follow the exact same CMS patterns used by `WhyNavio` and `HowItWorks`:

- **All text** wrapped in `EditableTranslation` with `integrations.*` translation keys
- **Cards** wrapped in `EditableCard` (with `elementIdPrefix`) for CMS-driven background/text color editing via `UnifiedStyleModal`
- **Icons** use `EditableIcon` for CMS-editable icon selection per card
- Scroll animation via `useScrollAnimation`, translations via `useAppTranslation`
- `refreshKey` state pattern for live content updates after edits

## Files

| File | Change |
|---|---|
| `src/components/Integrations.tsx` | **New** — full section component |
| `src/pages/Index.tsx` | Add `<Integrations />` between `<HowItWorks />` and `<FinalCTA />` |

## Component Structure

```text
section (py-12 md:py-16 lg:py-section, data-header-color="dark")
  container (max-w-container)
    header:
      EditableTranslation("integrations.title") → h2
      EditableTranslation("integrations.subtitle") → p
    grid (1-col mobile, 3-col lg, gap-8):
      EditableCard(elementIdPrefix="integrations-card-1")
        EditableIcon(elementId="integrations-card-1-icon")
        EditableTranslation("integrations.card_1.label") → badge
        EditableTranslation("integrations.card_1.title") → h3
        EditableTranslation("integrations.card_1.description") → p
        EditableTranslation("integrations.card_1.quote") → blockquote
      EditableCard(elementIdPrefix="integrations-card-2")
        ...same pattern...
      EditableCard(elementIdPrefix="integrations-card-3")
        ...same pattern...
    tech credibility line:
      EditableTranslation("integrations.tech_line") → p (muted badges)
    CTA block:
      EditableTranslation("integrations.cta_title") → h3
      EditableTranslation("integrations.cta_subtitle") → p
      Button → LanguageLink to /contact
```

## CMS Features

- **Card backgrounds/text colors**: Editable via `EditableCard` → `UnifiedStyleModal` (supports presets, gradients, glass effects)
- **Card icons**: Editable via `EditableIcon` (icon picker from CMS)
- **All text**: Editable inline via `EditableTranslation`, auto-syncs to translation system for all enabled languages
- **Text colors**: Inherit from `BackgroundTextColorContext` provided by `EditableCard`

## Translation Keys (~20)

`integrations.title`, `integrations.subtitle`, `integrations.card_1.label`, `integrations.card_1.title`, `integrations.card_1.description`, `integrations.card_1.quote`, `integrations.card_2.label`, `integrations.card_2.title`, `integrations.card_2.description`, `integrations.card_2.note`, `integrations.card_3.label`, `integrations.card_3.title`, `integrations.card_3.description`, `integrations.tech_line`, `integrations.cta_title`, `integrations.cta_subtitle`, `integrations.cta_button`

All keys use the `t('key', 'fallback')` pattern with hardcoded English fallbacks so the section renders immediately without needing DB seed data.

