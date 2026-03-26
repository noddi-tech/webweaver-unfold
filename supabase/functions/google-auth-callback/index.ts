import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

async function encrypt(text: string, key: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(text))
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)])
  return btoa(String.fromCharCode(...combined))
}

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // team_member_id

  if (!code || !state) {
    return new Response('Missing code or state parameter', { status: 400 })
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: Deno.env.get('GOOGLE_REDIRECT_URL')!,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (tokens.error) {
      console.error('Token exchange error:', tokens)
      return new Response(`Token exchange failed: ${tokens.error_description || tokens.error}`, { status: 400 })
    }

    if (!tokens.refresh_token) {
      return new Response(
        'No refresh token received. The user may need to revoke access at https://myaccount.google.com/permissions and re-authorize.',
        { status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const encryptionKey = Deno.env.get('FERNET_KEY')!

    // Upsert encrypted tokens
    const { error: upsertError } = await supabase.from('google_oauth_tokens').upsert({
      team_member_id: state,
      access_token_encrypted: await encrypt(tokens.access_token, encryptionKey),
      refresh_token_encrypted: await encrypt(tokens.refresh_token, encryptionKey),
      token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }, { onConflict: 'team_member_id' })

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return new Response(`Database error: ${upsertError.message}`, { status: 500 })
    }

    // Mark employee as connected
    await supabase.from('employees')
      .update({ google_calendar_connected: true })
      .eq('id', state)

    // Redirect back to admin
    return new Response(null, {
      status: 302,
      headers: { Location: 'https://naviosolutions.com/cms?tab=booking&calendar=connected' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(`Internal error: ${err.message}`, { status: 500 })
  }
})
