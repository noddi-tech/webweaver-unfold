

# Fix Availability Time Display Bug

## Root Cause

The database stores times with seconds (`10:00:00`), but `TIME_OPTIONS` in BookingManager uses `HH:MM` format (`10:00`). When the availability sheet opens, the `Select` component receives `value="10:00:00"` but has no matching option, so it displays blank.

## Fix — `src/components/design-system/BookingManager.tsx`

**Line 167**: Strip seconds when loading general availability rules:
```typescript
return {
  day,
  enabled: !!existing,
  start: (existing?.start_time || "09:00").slice(0, 5),
  end: (existing?.end_time || "16:00").slice(0, 5),
};
```

**Line 181**: Same fix for event-type recurring rules:
```typescript
return {
  day,
  enabled: !!existing,
  start: (existing?.start_time || "09:00").slice(0, 5),
  end: (existing?.end_time || "17:00").slice(0, 5),
};
```

**Lines 186-187**: Same fix for event-type date ranges:
```typescript
start_time: (a.start_time || "09:00").slice(0, 5),
end_time: (a.end_time || "17:00").slice(0, 5),
```

## Files changed

| File | Change |
|------|--------|
| `src/components/design-system/BookingManager.tsx` | `.slice(0, 5)` on all loaded time values to strip seconds |

