

# Fix WhyNavio: Remove Hardcoded Colors, Let CMS Control Everything

## Problem
The "Before" and "After" cards look identical because hardcoded Tailwind text-color classes on child elements (e.g. `text-muted-foreground`, `text-primary`, `text-foreground`) override the CMS-driven colors from `EditableCard` and `EditableTranslation`. The visual differentiation needs to come from the database, not hardcoded classes.

## What's already CMS-driven (no changes needed)
- **Card backgrounds**: `EditableCard` reads from `background_styles` table
- **Card text color**: `BackgroundTextColorProvider` cascades from `EditableCard`
- **Icon colors**: `EditableListIcon` reads from `icon_styles` table via inline styles
- **All text content**: `EditableTranslation` with per-key styling from `translations` table
- **Border color tokens** like `border-primary` use `var(--primary)` which is CMS-managed in `color_tokens`

## What's broken: hardcoded overrides on children
These hardcoded classes prevent the CMS values from showing:
- `text-muted-foreground` on Before card's `<h3>` and `<span>` elements
- `text-primary` on After card's `<h3>`
- `text-foreground` on After card's `<span>` elements
- `text-muted-foreground/80` on Before list items

Per the project's own architecture rule: *"hardcoded Tailwind text-color classes must be removed from child elements so CMS-provided inline styles take precedence."*

## Changes

### 1. `src/components/WhyNavio.tsx` — Remove hardcoded text color classes

Remove all hardcoded `text-*` color classes from child elements inside both cards:

- **Before card title** (`h3`): Remove `text-muted-foreground` — let `EditableTranslation` + `BackgroundTextColorContext` handle it
- **Before card list items** (`span`): Remove `text-muted-foreground/80` — same reason
- **After card title** (`h3`): Remove `text-primary` — let CMS handle it
- **After card list items** (`span`): Remove `text-foreground` — let CMS handle it

Keep all structural/layout classes (`font-bold`, `font-medium`, `text-2xl`, etc.) — those aren't colors.

### 2. Database migration — Set correct initial CMS values

Update `background_styles` rows so the two cards have visually distinct CMS-driven styling:

**Before card** (`why-noddi-before-card-background`):
- `background_class` → `bg-muted/50` (muted gray)
- `text_color_class` → `muted-foreground` (faded text)

**After card** (`why-noddi-after-card-background`):
- `background_class` → `bg-card` (clean card surface)
- `text_color_class` → `foreground` (full contrast text)

This makes the differentiation editable via the CMS pencil button on each card — admins can change it anytime without code changes.

### 3. Keep structural (non-color) differentiation in code

These stay because they define layout/structure, not color:
- `border-2 border-primary` on the After card (uses design token `--primary`)
- `shadow-lg`, `lg:scale-105` on the After card (elevation, not color)
- `border border-border/50` on the Before card (uses design token `--border`)
- The decorative gradient overlay (`from-primary/10`) references the `--primary` token

## Result
- Both cards' text colors become fully CMS-editable via the pencil button
- The visual "winner vs. loser" difference comes from distinct database entries
- Admins can adjust the contrast between cards at any time without developer involvement
- Border and shadow tokens still reference the design system CSS variables

## Files changed
| File | Change |
|---|---|
| `src/components/WhyNavio.tsx` | Remove hardcoded `text-*` color classes from children |
| New migration | Update `background_styles` rows for both cards |

