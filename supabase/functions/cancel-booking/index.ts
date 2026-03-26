import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function decrypt(encryptedB64: string, key: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32))
  const combined = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data)
  return new TextDecoder().decode(decrypted)
}

async function encrypt(text: string, key: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(text))
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)])
  return btoa(String.fromCharCode(...combined))
}

async function getAccessToken(supabase: any, tokenRow: any, encKey: string): Promise<string> {
  if (new Date(tokenRow.token_expiry) > new Date(Date.now() + 5 * 60 * 1000)) {
    return await decrypt(tokenRow.access_token_encrypted, encKey)
  }

  const refreshToken = await decrypt(tokenRow.refresh_token_encrypted, encKey)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
      grant_type: 'refresh_token',
    }),
  })
  const tokens = await res.json()

  if (tokens.error) {
    throw new Error(`Token refresh failed: ${tokens.error}`)
  }

  await supabase.from('google_oauth_tokens').update({
    access_token_encrypted: await encrypt(tokens.access_token, encKey),
    token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  }).eq('team_member_id', tokenRow.team_member_id)

  return tokens.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { booking_id, cancel_token } = await req.json()

    if (!booking_id || !cancel_token) {
      return new Response(JSON.stringify({ error: 'Missing booking_id or cancel_token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const encKey = Deno.env.get('FERNET_KEY')!

    // Validate token and get booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, event_types(title)')
      .eq('id', booking_id)
      .eq('cancel_token', cancel_token)
      .single()

    if (error || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found or invalid token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (booking.status === 'cancelled') {
      return new Response(JSON.stringify({ error: 'Booking is already cancelled' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cancel the booking
    await supabase.from('bookings').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', booking_id)

    // Delete Google Calendar event if exists
    if (booking.google_calendar_event_id) {
      const { data: bookingMembers } = await supabase
        .from('booking_members')
        .select('team_member_id')
        .eq('booking_id', booking_id)

      const memberIds = (bookingMembers || []).map((m: any) => m.team_member_id)

      for (const memberId of memberIds) {
        const { data: tokenRow } = await supabase
          .from('google_oauth_tokens')
          .select('*')
          .eq('team_member_id', memberId)
          .single()

        if (!tokenRow) continue

        try {
          const accessToken = await getAccessToken(supabase, tokenRow, encKey)

          const delRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${booking.google_calendar_event_id}?sendUpdates=all`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )

          if (delRes.ok || delRes.status === 410) {
            console.log('Calendar event deleted successfully')
            break
          } else {
            const errText = await delRes.text()
            console.error('Calendar delete failed:', errText)
          }
        } catch (err) {
          console.error(`Calendar delete error for member ${memberId}:`, err)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('cancel-booking error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
