

# Fix Integration Strip SVG: Readability and Two-Way Sync Prominence

## Problems (from screenshot)
1. The left box ("Your system") has no visible title text -- the `fill-card` background makes "Your system" text invisible against a similar-colored background
2. The "Eontyre, ERP, CRM..." subtitle is barely readable (too light)
3. The two-way sync circle is small and not prominent enough -- the key selling point of bidirectional sync gets lost
4. Arrow labels are tiny (fontSize 10) and hard to read

## Changes to `src/components/IntegrationStrip.tsx`

### SVG diagram fixes

1. **Left box text readability**: Add a visible border to the left box (`strokeWidth="2"`) and ensure text uses `fill-foreground` with larger font size (17px for title, 12px for subtitle)

2. **Make sync icon bigger and more prominent**: 
   - Increase sync circle radius from 16 to 24
   - Add a "Two-way sync" label below the circle
   - Make the sync arrows inside the circle larger and bolder (strokeWidth 2)
   - Add a subtle pulsing animation class to draw attention

3. **Increase arrow label font sizes** from 10px to 12px for readability

4. **Increase arrow stroke width** from 1.5 to 2 for visibility

5. **Add "Your system" title above the left box** or increase the font size inside it to 17px to match Navio box

### Layout adjustment
- Widen the viewBox slightly if needed to accommodate the larger sync element
- Keep the same responsive behavior

### Files
| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Fix SVG text readability, enlarge sync icon, add "Two-way sync" label, increase font sizes and stroke widths |

