

# Replace Navio Card Gradient with Velvet Mesh

## Problem

The Navio card in the SVG diagram uses a hardcoded `<linearGradient>` (`navioGrad`) which isn't editable via CMS. The user wants the velvet mesh gradient instead.

## Fix

Since SVG `fill` can't use CSS `background-image` (mesh gradients are radial-gradient combos), convert the Navio box from an SVG `<rect>` to an HTML `<div>` overlaid on the SVG using absolute positioning — or simpler: use `<foreignObject>` inside the SVG to render an HTML div with the CSS gradient class.

### `src/components/IntegrationStrip.tsx`

1. Replace the SVG `<rect>` at line 142 (`fill="url(#navioGrad)"`) with a `<foreignObject>` containing an HTML div that uses `bg-gradient-mesh-velvet` class
2. Remove the `<linearGradient id="navioGrad">` definition from `<defs>` (lines 115-119) since it's no longer used
3. Keep the text elements as SVG `<text>` positioned the same way

The foreignObject approach:
```xml
<foreignObject x="330" y="60" width="160" height="160">
  <div className="w-full h-full rounded-[20px] bg-gradient-mesh-velvet" />
</foreignObject>
```

This lets the Navio card use any CSS background including mesh gradients, and the velvet mesh will render correctly.

## Files changed

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Replace SVG rect+linearGradient with foreignObject using `bg-gradient-mesh-velvet` |

