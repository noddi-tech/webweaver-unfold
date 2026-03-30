

# Add Calendar Booking Link to Internal Hub

## Change — `src/pages/Internal.tsx`

Add a new card to the **"Admin & Settings"** category (or optionally a new "Tools" category):

```typescript
{ title: "Calendar & Booking", description: "Manage availability & bookings", href: "/cms?tab=booking", icon: Calendar }
```

`Calendar` icon is already imported. Single line addition to the existing cards array.

## Files changed

| File | Change |
|------|--------|
| `src/pages/Internal.tsx` | Add "Calendar & Booking" card to Admin & Settings |

