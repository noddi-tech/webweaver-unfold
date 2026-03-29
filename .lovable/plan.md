

# Add Google OAuth to CMS Login

## Summary

Add a "Sign in with Google" button to the Auth page using Supabase's built-in Google OAuth provider. This is a client-side change only — the Google provider must be enabled in the Supabase dashboard.

## Prerequisites (User Action Required)

You need to configure Google OAuth in your Supabase dashboard:

1. Go to **Supabase Dashboard → Authentication → Providers → Google**
2. Enable Google provider
3. Add your **Google Client ID** and **Client Secret** (the same ones you already have as edge function secrets: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`)
4. Copy the **Callback URL** shown in the Supabase dashboard
5. In **Google Cloud Console → OAuth Client → Authorized redirect URIs**, add that Supabase callback URL
6. Under **Authentication → URL Configuration**, set:
   - **Site URL**: `https://naviosolutions.com`
   - **Redirect URLs**: add `https://naviosolutions.com/cms`

## Code Change

### `src/pages/Auth.tsx`

Add a "Sign in with Google" button below the email/password form (visible only in `signin` mode):

- Uses `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/cms' } })`
- Styled as an outline button with a Google icon (from lucide or inline SVG)
- Separated from the form by a divider ("or")

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add Google OAuth button with divider in signin mode |

One file, ~15 lines added.

