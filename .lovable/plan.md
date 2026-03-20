

# Fix Logo Marquee: Spacing & Infinite Loop

## Problems
1. **Uneven spacing** between last and first logo — the Strip uses `justify-around` which distributes space unevenly, and there's no gap between the two strips
2. **Visible reset** — the animation translates `-50%` but the two strips don't perfectly tile because `min-w-full` + `justify-around` doesn't guarantee seamless wrapping

## Fix

**`src/components/LogoMarquee.tsx`** — Replace the Strip layout:
- Change from `min-w-full justify-around gap-14` to a fixed `gap-14` with no `min-w-full` or `justify-around`
- Each strip should just be a simple flex row with consistent `gap-14` spacing
- Add `gap-14` on the outer `animate-marquee` container too, so the gap between strip A's last logo and strip B's first logo matches the internal gaps
- This makes the two strips tile seamlessly, creating a true infinite loop

**`src/index.css`** — No changes needed; the `translateX(-50%)` animation is correct for two identical strips.

## Files
| File | Change |
|---|---|
| `src/components/LogoMarquee.tsx` | Strip: remove `min-w-full justify-around`, use consistent `gap-14` only. Outer marquee div: add `gap-14`. |

