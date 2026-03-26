
You did add the backend secrets, but that is not the whole requirement for this specific flow.

What’s happening

1. Frontend/client ID mismatch
- The Connect button in `src/components/design-system/BookingManager.tsx` builds the Google OAuth URL with:
  `import.meta.env.VITE_GOOGLE_CLIENT_ID`
- Your screenshot shows these Supabase function secrets:
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL`
- Those secrets are available to the edge function, but the browser button is using a different variable name: `VITE_GOOGLE_CLIENT_ID`
- So the backend can be configured correctly while the browser still opens Google with an empty or missing client ID

2. Preview iframe block
- Google OAuth is commonly blocked inside the Lovable preview iframe
- So even with correct credentials, the Connect flow can fail in preview with the blocked-response error
- This needs to be tested from the published site or a standalone browser tab, not the editor preview

3. Redirect URI must match exactly
- The frontend sends users to:
  `https://ouhfgazomdmirdazvjys.supabase.co/functions/v1/google-auth-callback`
- The callback function exchanges the code using `GOOGLE_REDIRECT_URL`
- Those must be exactly the same value, and that exact URI must also be registered in Google Cloud

What to verify next

1. Make sure the browser-side value exists as `VITE_GOOGLE_CLIENT_ID`
2. Make sure `GOOGLE_REDIRECT_URL` is exactly:
   `https://ouhfgazomdmirdazvjys.supabase.co/functions/v1/google-auth-callback`
3. In Google Cloud OAuth settings, verify:
   - Authorized redirect URI = that exact Supabase callback URL
   - Authorized JavaScript origins include the published site:
     `https://noddi-tech-website.lovable.app`
     and your custom domain too, if you use one
4. Re-test from the published site, not from the Lovable preview iframe

Technical details

- Browser code uses: `VITE_GOOGLE_CLIENT_ID`
- Edge function uses: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL`
- Most likely current issue: you added the edge-function secrets, but the frontend still depends on a separate public client ID variable, and preview iframe testing is also blocked by Google

Best next implementation
- Update the Connect flow so the frontend does not depend on `VITE_GOOGLE_CLIENT_ID` directly
- Instead, generate the Google auth URL from a backend/edge function and open that URL from the UI
- That removes the frontend env mismatch and makes the setup more reliable
