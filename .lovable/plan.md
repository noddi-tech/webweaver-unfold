

# Hero Tightening

## Changes

### 1. Fix headline grammar in `index.html`
"Software that transform car maintenance" → "Software that **transforms** car maintenance" in:
- `<title>`
- `og:title`
- `og:image:alt`
- `twitter:title`

Note: The rotating headline on the page itself comes from the database (rotating_terms table), not from code. If the grammar issue also appears there, it needs to be fixed in the CMS/Translation Manager — not in code. I'll flag this.

### 2. Tighten the subtitle fallback in `src/components/Hero.tsx`
Current fallback: "Booking to billing. Built for automotive services."
This is already short (1 line). The actual displayed text may come from the CMS `hero.subtitle` translation key. I'll update the fallback to a tighter version that captures the full message the user wants:

**New fallback**: "Booking, capacity, scheduling, routing, and communication — one platform, zero handoffs."

This keeps it to 1-2 lines on desktop and conveys the core message.

### 3. Skip the product screenshot addition
The hero already has a full image/carousel section below the text. Adding a side-by-side layout would be a significant restructure. Skipping per the "only if straightforward" instruction.

## Files

| File | Change |
|---|---|
| `index.html` | Fix "transform" → "transforms" in 4 meta tags |
| `src/components/Hero.tsx` | Update subtitle fallback text |

