

# Fix: Booking Confirmation Emails Not Sending

## Root Cause

The `create-booking` edge function hardcodes `from: 'Navio Solutions <noreply@naviosolutions.com>'` (line 354). But in Resend, only **subdomains** are verified (`info.naviosolutions.com`, `career.naviosolutions.com`). The root domain `naviosolutions.com` is not a verified sender domain.

The working pricing offer emails use `sales@info.naviosolutions.com` — a verified subdomain — via a `getFromAddress()` helper that checks Resend's domain API.

Additionally, the code doesn't check the Resend API response at all (lines 347-360), so the rejection is silently ignored and "Confirmation email sent" is logged even when Resend returns an error.

## Fix in `supabase/functions/create-booking/index.ts`

1. **Import the shared `getFromAddress` helper** from `_shared/email-domain.ts` (already exists, used by other functions)
2. **Replace the hardcoded from address** with `await getFromAddress(resendKey, 'hello')` — this checks verified domains in priority order
3. **Check the Resend API response** and log the actual error if it fails

### Before (line 347-360):
```typescript
await fetch('https://api.resend.com/emails', { ... })
console.log('Confirmation email sent to', guest_email)
```

### After:
```typescript
import { getFromAddress } from '../_shared/email-domain.ts'
// ...
const fromAddress = await getFromAddress(resendKey, 'hello')
const emailRes = await fetch('https://api.resend.com/emails', {
  // ... use fromAddress instead of hardcoded string
})
if (!emailRes.ok) {
  const errText = await emailRes.text()
  console.error('Resend API error:', errText)
} else {
  console.log('Confirmation email sent to', guest_email)
}
```

One file change, ~10 lines modified. Redeploy the edge function after.

| File | Change |
|------|--------|
| `supabase/functions/create-booking/index.ts` | Use shared `getFromAddress` helper + check response |

