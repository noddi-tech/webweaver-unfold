

# Change Navio Card Text to Federal Blue

The Navio card text (lines 132-136) currently uses `fill-primary-foreground` (white). Change both `<text>` elements to use Federal Blue (`hsl(249, 67%, 24%)`) via direct `fill` attribute, matching the "Your system" box text style.

## File: `src/components/IntegrationStrip.tsx`

- Line 132: Replace `className="fill-primary-foreground"` with `fill="hsl(249, 67%, 24%)"` 
- Line 135: Replace `className="fill-primary-foreground"` with `fill="hsl(249, 67%, 24%)"` and remove `opacity="0.8"` (use `opacity="0.7"` to match left box style)

