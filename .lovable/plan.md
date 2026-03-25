

# New Customer Testimonial Section

## What
A new `CustomerTestimonial.tsx` component placed between `IntegrationStrip` and `FinalCTA` on the homepage. Full-width, center-aligned, single-column testimonial with generous breathing room.

## Layout and content
- Decorative oversized `Quote` icon (lucide-react) at top, muted opacity (~15-20%)
- Large centered quote text styled as a pullquote (text-2xl md:text-3xl lg:text-4xl, font-medium, italic or serif-like weight)
- Attribution: circular avatar with "TD" initials, placeholder name "[Name]", title "Operations Manager, Trønderdekk"
- Small muted company name badge below attribution
- No card wrapper — section background is the container
- Background: `bg-background` (white/light) to alternate with the `bg-muted/30` of IntegrationStrip above

## CMS integration
All text wrapped in `EditableTranslation` with keys:
| Key | Fallback |
|---|---|
| `testimonial.quote` | "We kept Eontyre for what it does well..." |
| `testimonial.author_name` | "[Name]" |
| `testimonial.author_title` | "Operations Manager, Trønderdekk" |
| `testimonial.company_name` | "Trønderdekk" |

## Spacing
Extra generous: `py-20 md:py-28 lg:py-36` — noticeably more than standard sections to create a "pause" feel.

## Mobile
Same layout, scaled down. Quote stays prominent. Avatar + attribution stack remains centered.

## Files

| File | Change |
|---|---|
| `src/components/CustomerTestimonial.tsx` | **New** — testimonial section component |
| `src/pages/Index.tsx` | Import and place `<CustomerTestimonial />` between `<IntegrationStrip />` and `<FinalCTA />` |

