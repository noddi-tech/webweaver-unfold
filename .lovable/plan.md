

# Polish the Integration Strip Design

## Changes to `src/components/IntegrationStrip.tsx`

### 1. SVG diagram — Navio box uses brand gradient
Replace the flat `fill-primary` rect with an SVG `linearGradient` definition using the existing brand gradient tokens (`--gradient-sunset`: federal blue → vibrant purple → brand orange). Add `rx="20"` for rounder corners on both boxes.

The "Your system" box gets a warmer fill using `hsl(var(--muted))` instead of `fill-background`.

### 2. SVG arrows — thicker with animated dash flow
- Increase `strokeWidth` from `2` to `2.5`
- Add `strokeDasharray="6 4"` to the connecting lines
- Add a CSS `@keyframes dash-flow` animation that offsets `stroke-dashoffset` continuously, creating a flowing-dots effect on the arrows
- Apply via inline `style={{ animation: 'dash-flow 1.5s linear infinite' }}`

### 3. SVG sync circle — subtle pulse
Add a slow `animate-pulse` (or a custom gentle scale pulse) on the center sync circle to make it feel alive.

### 4. Tech badges — more visual weight
Change from `Badge variant="outline"` to a custom class with `bg-card border border-border shadow-sm` for a filled look that stands out against the `bg-muted/30` section background. Add small icons (lucide: `Globe`, `Webhook`, `Wrench`, `FileJson`) before each badge label.

### 5. Partner pill — bolder styling
Give the "Eontyre" pill slightly more visual weight: `bg-card border border-border/60 shadow-sm rounded-lg px-5 py-2.5 font-semibold`. Keep as text since no partner logo image is available in the project.

### 6. Section background — strengthen visibility
Change `bg-muted/30` to `bg-muted/50` for a more visible differentiation from surrounding white sections. Keep `border-y border-border/40`.

### 7. Add dash-flow keyframes
Add a small CSS animation in the component (via `<style>` tag in SVG defs or inline) for the flowing dash effect:
```css
@keyframes dash-flow {
  to { stroke-dashoffset: -20; }
}
```

## Files changed
| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | SVG gradient, rounder corners, animated arrows, pulse sync, beefier badges with icons, stronger bg |

