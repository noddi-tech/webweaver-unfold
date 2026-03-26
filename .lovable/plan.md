

# Fix OAuth Callback Redirect to Published Domain

## Problem
The `google-auth-callback` edge function redirects to a relative path `/cms?tab=booking&calendar=connected`, which resolves against the Supabase domain (causing the "requested path is invalid" error). The previous plan suggested using `noddi-tech-website.lovable.app`, but the actual published domain is `naviosolutions.com`.

## Fix

**`supabase/functions/google-auth-callback/index.ts`** — Line 79:

Change:
```typescript
headers: { Location: '/cms?tab=booking&calendar=connected' },
```
To:
```typescript
headers: { Location: 'https://naviosolutions.com/cms?tab=booking&calendar=connected' },
```

That's the only change needed. One line, one file.

## Google Cloud Configuration
Your Google Cloud Console **Authorized redirect URI** should remain pointed at the Supabase edge function URL (e.g. `https://ouhfgazomdmirdazvjys.supabase.co/functions/v1/google-auth-callback`). That part is correct — the redirect URI is where Google sends the OAuth code. The fix here is where the edge function sends the *user's browser* after processing.

| File | Change |
|---|---|
| `supabase/functions/google-auth-callback/index.ts` | Redirect to `https://naviosolutions.com/cms?tab=booking&calendar=connected` |

