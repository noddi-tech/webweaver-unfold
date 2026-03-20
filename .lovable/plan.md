

# Fix Logo Sizes & Header Breakpoint

## 1. Increase Logo Marquee Size

**Problem**: Logos use `h-6` (24px) which is too small to read, especially for text-heavy logos like "Hurtigruta Carglass."

**Change in `src/components/LogoMarquee.tsx`**:
- Increase logo height from `h-6` to `h-8` (32px) across all three render paths (Strip, static display, skeleton)
- Update skeleton placeholder width from `w-24` to `w-28` to match

## 2. Raise Header Responsive Breakpoint

**Problem**: The desktop nav uses `md:` (768px) breakpoint but at ~825px the nav items + CTA + language switcher + avatar are too cramped, making the logo area look squished.

**Change in `src/components/Header.tsx`**:
- Change all `md:hidden` / `hidden md:flex` / `md:hidden` breakpoints to `lg:hidden` / `hidden lg:flex` so the hamburger menu kicks in below 1024px instead of 768px
- This affects: desktop nav container, right-side buttons container, mobile menu button, and mobile menu panel

## Files to Modify

| File | Change |
|---|---|
| `src/components/LogoMarquee.tsx` | `h-6` → `h-8` for logos, `w-24` → `w-28` for skeletons |
| `src/components/Header.tsx` | `md:` → `lg:` breakpoint for nav desktop/mobile toggle (~6 occurrences) |

