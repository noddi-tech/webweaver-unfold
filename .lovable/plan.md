

# Fix IntegrationStrip Diagram, Badges & Footer

## 1. Replace Navio card gradient with Warmth + Federal Blue border

In `src/components/IntegrationStrip.tsx`, change the Navio `foreignObject` div from `bg-gradient-mesh-velvet` to use `--gradient-warmth` (which already exists: purple to pink to orange). Add a Federal Blue border (`border-2` with `hsl(249 67% 24%)`).

```tsx
<foreignObject x="330" y="60" width="160" height="160">
  <div className="w-full h-full rounded-[20px]" 
    style={{ 
      backgroundImage: 'var(--gradient-warmth)', 
      border: '2px solid hsl(249 67% 24%)' 
    }} />
</foreignObject>
```

## 2. Fix dash-flow animation (moving data lines)

The SVG paths reference `animation: "dash-flow 1.5s linear infinite"` but this keyframe is never defined. Add it to `src/index.css`:

```css
@keyframes dash-flow {
  to { stroke-dashoffset: -20; }
}
@keyframes gentle-pulse {
  0%, 100% { transform-origin: center; transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.85; }
}
```

## 3. Add missing left "Your system" box to SVG

The SVG only has the Navio box on the right — no left box. The curved paths start at x=170 but there's no visible box there. Add a left box with white/card background and Federal Blue border:

```tsx
{/* Left box — Your system */}
<rect x="10" y="60" width="160" height="160" rx="20" 
  fill="white" stroke="hsl(249, 67%, 24%)" strokeWidth="2" />
<text x="90" y="128" textAnchor="middle" fill="hsl(249, 67%, 24%)" fontSize="17" fontWeight="700">
  {t("integrations_strip.diagram_your_system", "Your system")}
</text>
<text x="90" y="152" textAnchor="middle" fill="hsl(249, 67%, 24%)" fontSize="12" opacity="0.7">
  {t("integrations_strip.diagram_your_system_subtitle", "ERP · CRM · DMS")}
</text>
```

## 4. Give Eontyre pill and tech badges white background

In `src/components/IntegrationStrip.tsx`:
- Add `bg-white` to the Eontyre partner pill div (line 63)
- Add `bg-white` to each Badge className (line 81)

## 5. Remove gradient from Footer

In `src/components/Footer.tsx`, remove the gradient overlay div (lines 55-59) and change the footer card to use a simple `bg-card` or `bg-muted` background instead.

Replace lines 53-60:
```tsx
<div className="rounded-3xl overflow-hidden relative bg-card">
```
Remove the gradient `<div>` entirely.

## Files changed

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Warmth gradient + Federal Blue border on Navio box; add left "Your system" box; white bg on badges/pills |
| `src/index.css` | Add `@keyframes dash-flow` and `@keyframes gentle-pulse` |
| `src/components/Footer.tsx` | Remove gradient overlay, use plain `bg-card` background |

