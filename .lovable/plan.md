

# Fix Trust Bar & Simplify Hero

## Issues
1. **Broken images in trust bar**: The `LogoMarquee` shows broken image icons because the CMS `images` table has no entries with `section = 'trust-bar'`, so it falls back to `via.placeholder.com` URLs which are broken. The fallback placeholder URLs need to be removed — show nothing (or a subtle empty state) when no CMS logos exist yet.
2. **Duplicate LogoMarquee**: There's a `<LogoMarquee />` inside `Hero.tsx` (line 314) AND one in `Index.tsx`. Remove the one inside Hero.
3. **Hero gradient card**: The hero wraps content in a `rounded-3xl` card with a purple gradient background (lines 184-191). Remove this card wrapper and gradient — use plain white/background color instead.

## Changes

### 1. `src/components/Hero.tsx`
- **Remove the LogoMarquee import and usage** (line 17, line 314)
- **Remove the gradient card wrapper**: Delete the `rounded-3xl` div (line 184) and the gradient `div` (lines 186-191). Keep the content but render it directly on the page background.
- **Fix USP text colors**: The USPs currently use `text-white` (lines 331-360) because they sat on a purple gradient. Change these to `text-foreground` and `text-muted-foreground` to work on white background.
- **Remove the purple glow effect** behind the USPs (lines 319-323)
- **Remove the outer `px-2.5` padding** on the section since there's no card anymore — use standard section padding

### 2. `src/components/LogoMarquee.tsx`
- **Remove placeholder fallback logos** (lines 61-68). When no CMS images exist for the section, set logos to an empty array and render nothing (return `null` early).

### 3. `src/pages/Index.tsx`
- No changes needed — already has the trust bar `<LogoMarquee />` in the right position between Hero and ScrollingFeatureCards.

## Files

| File | Change |
|---|---|
| `src/components/Hero.tsx` | Remove LogoMarquee, gradient card, purple glow; fix text colors to work on white bg |
| `src/components/LogoMarquee.tsx` | Remove placeholder fallback; return null when no CMS logos |

