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
    const {
      event_type_id,
      start_time,
      guest_name,
      guest_email,
      guest_company,
      guest_message,
      guest_timezone,
    } = await req.json()

    if (!event_type_id || !start_time || !guest_name || !guest_email || !guest_timezone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const encKey = Deno.env.get('FERNET_KEY')!

    // 1. Get event type
    const { data: eventType } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', event_type_id)
      .single()

    if (!eventType) {
      return new Response(JSON.stringify({ error: 'Event type not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const duration = eventType.duration_minutes || 30
    const endTime = new Date(new Date(start_time).getTime() + duration * 60000).toISOString()

    // 2. Get assigned members
    const { data: etMembers } = await supabase
      .from('event_type_members')
      .select('team_member_id')
      .eq('event_type_id', event_type_id)

    const memberIds = (etMembers || []).map((m: any) => m.team_member_id)

    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id, name, email')
      .in('id', memberIds)
      .eq('is_active', true)

    // 3. Check for conflicts in DB
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('status', 'confirmed')
      .eq('event_type_id', event_type_id)
      .lt('start_time', endTime)
      .gt('end_time', start_time)

    if (conflicts && conflicts.length > 0) {
      return new Response(JSON.stringify({ error: 'This time slot has already been booked' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_type_id,
        guest_name,
        guest_email,
        guest_company: guest_company || null,
        guest_message: guest_message || null,
        guest_timezone,
        start_time,
        end_time: endTime,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking insert error:', bookingError)
      return new Response(JSON.stringify({ error: bookingError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Insert booking members
    if (memberIds.length > 0) {
      await supabase.from('booking_members').insert(
        memberIds.map((id: string) => ({ booking_id: booking.id, team_member_id: id }))
      )
    }

    // 6. Create Google Calendar event (using first connected member's token)
    let meetLink: string | null = null
    let calendarEventId: string | null = null

    for (const member of (teamMembers || [])) {
      const { data: tokenRow } = await supabase
        .from('google_oauth_tokens')
        .select('*')
        .eq('team_member_id', member.id)
        .single()

      if (!tokenRow) continue

      try {
        const accessToken = await getAccessToken(supabase, tokenRow, encKey)

        const calendarEvent = {
          summary: `${eventType.title} — ${guest_name}${guest_company ? ` (${guest_company})` : ''}`,
          description: `Booked via naviosolutions.com\n\nGuest: ${guest_name}\nEmail: ${guest_email}${guest_company ? `\nCompany: ${guest_company}` : ''}${guest_message ? `\nNote: ${guest_message}` : ''}`,
          start: { dateTime: start_time, timeZone: 'UTC' },
          end: { dateTime: endTime, timeZone: 'UTC' },
          attendees: [
            ...(teamMembers || []).map((m: any) => ({ email: m.email })),
            { email: guest_email },
          ],
          conferenceData: {
            createRequest: {
              requestId: `navio-${booking.id}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 60 },
              { method: 'popup', minutes: 15 },
            ],
          },
        }

        const calRes = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(calendarEvent),
          }
        )

        const calData = await calRes.json()

        if (calData.id) {
          calendarEventId = calData.id
          meetLink = calData.hangoutLink || calData.conferenceData?.entryPoints?.[0]?.uri || null

          // Update booking with calendar info
          await supabase.from('bookings').update({
            google_calendar_event_id: calendarEventId,
            meet_link: meetLink,
          }).eq('id', booking.id)

          break // Only create on first connected member's calendar
        } else {
          console.error('Calendar event creation failed:', calData)
        }
      } catch (err) {
        console.error(`Calendar error for ${member.email}:`, err)
        // Continue — booking is still confirmed even without calendar event
      }
    }

    return new Response(JSON.stringify({
      booking: {
        ...booking,
        google_calendar_event_id: calendarEventId,
        meet_link: meetLink,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-booking error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
