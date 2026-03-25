

# Fix: Edit Button Not Working in Image Manager

## Root Cause

In `ImageEditModalFull.tsx` (line 54), the component uses `useState` instead of `useEffect` to sync the `editedImage` state when the `image` prop changes:

```tsx
// BUG: useState callback only runs once on mount, not on prop changes
useState(() => {
  setEditedImage(image);
});
```

This means when you click the edit button, `editedImage` stays `null` (its initial value from line 51), so the modal either renders nothing or shows stale data.

## Fix

**`src/components/design-system/ImageEditModalFull.tsx`**

1. Add `useEffect` to the imports (already imports `useState`)
2. Replace the broken `useState` call (lines 54-56) with a proper `useEffect`:

```tsx
useEffect(() => {
  setEditedImage(image);
}, [image]);
```

This ensures `editedImage` updates every time a new image is passed to the modal.

## Files

| File | Change |
|---|---|
| `src/components/design-system/ImageEditModalFull.tsx` | Replace `useState` sync with `useEffect`; add `useEffect` import |

