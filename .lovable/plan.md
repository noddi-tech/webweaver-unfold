

# Upgrade Testimonial Section

## What changes
Enhance the `CustomerTestimonial` component with larger author photos, decorative quotation marks, warm background tint, and more editorial quote styling. Add a `quote_author_image_url` column to `customer_stories` since one doesn't exist yet.

## Changes

### 1. Database migration — Add author photo column
The `customer_stories` table has no field for author photos (only `company_logo_url`). Add:
```sql
ALTER TABLE customer_stories ADD COLUMN quote_author_image_url text;
```

### 2. `src/components/CustomerTestimonial.tsx` — Visual upgrade

**Warm background tint:**
- Change section bg from `bg-background` to `bg-muted/30` — uses the `--muted` design token for a subtle warm differentiation from surrounding white sections

**Large decorative quotation marks:**
- Replace the single small `<Quote>` icon with two large decorative `"` characters flanking the quote
- Positioned as `absolute` elements: opening mark top-left, closing mark bottom-right of the blockquote
- Styled: `text-7xl md:text-8xl text-primary/10 font-serif select-none` — large, muted, decorative

**Larger author avatar (80-100px):**
- Change Avatar from `h-14 w-14` to `h-20 w-20 md:h-24 md:w-24`
- Fetch `quote_author_image_url` from the query alongside existing fields
- Use `quote_author_image_url` as the primary avatar source (person photo), fall back to `company_logo_url` (logo)
- Add `ring-4 ring-background shadow-lg` for a polished frame effect

**Quote text styling:**
- Already italic — bump size from `text-2xl md:text-3xl lg:text-4xl` to `text-2xl md:text-4xl lg:text-5xl`
- Add `font-serif` for editorial pullquote feel (falls back to system serif since no custom serif font is loaded — acceptable since it's a stylistic accent)
- Remove `tracking-tight`, add `leading-relaxed`

**Attribution layout:**
- Increase gap between avatar and text
- Author name: `text-lg font-semibold`
- Keep company name and "Read the full story →" link as-is

### 3. Update query to include new field
Add `quote_author_image_url` to the `.select()` call and the `TestimonialStory` interface.

## Files changed
| File | Change |
|---|---|
| New migration | Add `quote_author_image_url` column |
| `src/components/CustomerTestimonial.tsx` | Visual upgrade with larger avatar, decorative quotes, warm bg |

