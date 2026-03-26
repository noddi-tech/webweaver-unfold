

# Fix: White Text on Navio SVG Box

The Navio box in the integration diagram now uses the purple depth gradient background, but the text is still dark purple — making it nearly invisible. Change the Navio text and subtitle to white.

## File: `src/components/IntegrationStrip.tsx`

**Line 90**: Change `fill="hsl(249, 67%, 24%)"` → `fill="white"` on the Navio title text.

**Line 93**: Change `fill="hsl(249, 67%, 24%)"` → `fill="white"` and keep `opacity="0.7"` on the Navio subtitle text.

| Line | Change |
|---|---|
| 90 | Navio title: `fill="white"` |
| 93 | Navio subtitle: `fill="white"` |

