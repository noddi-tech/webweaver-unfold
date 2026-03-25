

# Add Soft Linen Background Color

## What we're doing
1. Add #F3F0E2 ("Soft Linen") as a color token in the database via migration
2. Change the `--background` CSS variable from pure white (`0 0% 100%`) to soft linen (`49 41% 92%`) so the entire page body uses this warm tone

## Changes

### 1. Database migration — insert color token
Insert into `color_tokens` table:
- `css_var`: `--color-soft-linen`
- `label`: `Soft Linen`
- `value`: `49 41% 92%` (HSL conversion of #F3F0E2)
- `color_type`: `solid`
- `category`: `surfaces`
- `preview_class`: `bg-soft-linen`
- `optimal_text_color`: `dark`
- `description`: `Warm linen background — #F3F0E2`

### 2. Update `src/index.css`
Change line 58:
```css
--background: 49 41% 92%;    /* Soft Linen #F3F0E2 - warm page background */
```

This single change makes every page use the soft linen tone since `html { background: hsl(var(--background)); }` is already set on line 251.

### Files changed
| Target | Change |
|---|---|
| Database migration | Insert soft linen into `color_tokens` |
| `src/index.css` | Update `--background` from `0 0% 100%` to `49 41% 92%` |

