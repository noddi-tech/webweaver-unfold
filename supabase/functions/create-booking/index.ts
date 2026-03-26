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
      duration_minutes: requested_duration,
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

    // Determine duration: use requested if valid within range, otherwise default
    let duration = eventType.duration_minutes || 30
    if (requested_duration && eventType.min_duration_minutes && eventType.max_duration_minutes) {
      if (requested_duration >= eventType.min_duration_minutes && requested_duration <= eventType.max_duration_minutes) {
        duration = requested_duration
      }
    }
    const endTime = new Date(new Date(start_time).getTime() + duration * 60000).toISOString()

    // 2. Get assigned members
    const { data: etMembers } = await supabase
      .from('event_type_members')
      .select('team_member_id')
      .eq('event_type_id', event_type_id)

    const memberIds = (etMembers || []).map((m: any) => m.team_member_id)

    const { data: teamMembers } = await supabase
      .from('employees')
      .select('id, name, email')
      .in('id', memberIds)
      .eq('active', true)

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

    // 4. Generate cancel token
    const cancelToken = crypto.randomUUID()

    // 5. Insert booking
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
        cancel_token: cancelToken,
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

    // 8. Send confirmation email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      try {
        const startDate = new Date(start_time)
        const formattedDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          timeZone: guest_timezone,
        })
        const formattedTime = startDate.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          timeZone: guest_timezone,
        })

        const manageUrl = `https://naviosolutions.com/book/manage/${booking.id}?token=${cancelToken}`
        const meetSection = meetLink
          ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">📹 Video Link</strong><br/><a href="${meetLink}" style="color:#6d28d9;text-decoration:none">${meetLink}</a></td></tr>`
          : ''

        const teamNames = (teamMembers || []).map((m: any) => m.name).join(', ')

        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:linear-gradient(135deg,#1a1a5e 0%,#6d28d9 100%);padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">Meeting Confirmed ✅</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="color:#333;font-size:16px;line-height:1.5;margin:0 0 24px">
            Hi ${guest_name},<br/><br/>Your meeting has been booked successfully. Here are the details:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">📅 Date</strong><br/><span style="color:#555">${formattedDate}</span></td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">🕐 Time</strong><br/><span style="color:#555">${formattedTime} (${guest_timezone})</span></td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">📋 Meeting</strong><br/><span style="color:#555">${eventType.title} (${duration} min)</span></td></tr>
            ${teamNames ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">👥 With</strong><br/><span style="color:#555">${teamNames}</span></td></tr>` : ''}
            ${meetSection}
          </table>
          <p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 24px">
            You'll also receive a Google Calendar invite at <strong>${guest_email}</strong> within a few minutes.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0">
              <a href="${manageUrl}" style="display:inline-block;background:#f4f4f7;color:#1a1a5e;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                Manage or Cancel Booking
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f9f9fb;text-align:center;border-top:1px solid #eee">
          <p style="margin:0;color:#999;font-size:12px">Navio Solutions · naviosolutions.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Navio Solutions <noreply@naviosolutions.com>',
            to: [guest_email],
            subject: `Meeting Confirmed: ${eventType.title} — ${formattedDate}`,
            html: emailHtml,
          }),
        })
        console.log('Confirmation email sent to', guest_email)
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
        // Don't fail the booking if email fails
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
