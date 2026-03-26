import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getFromAddress } from "../_shared/email-domain.ts"

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
    const { booking_id, cancel_token, new_start_time, duration_minutes } = await req.json()

    if (!booking_id || !cancel_token || !new_start_time) {
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

    // 1. Validate token and get booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, event_types(title, duration_minutes, min_duration_minutes, max_duration_minutes)')
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

    // Calculate duration
    const originalDuration = Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000)
    let duration = duration_minutes || originalDuration

    // Validate duration against event type limits
    if (booking.event_types?.min_duration_minutes && booking.event_types?.max_duration_minutes) {
      if (duration < booking.event_types.min_duration_minutes || duration > booking.event_types.max_duration_minutes) {
        duration = originalDuration
      }
    }

    const newEndTime = new Date(new Date(new_start_time).getTime() + duration * 60000).toISOString()

    // 2. Check for conflicts (exclude current booking)
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('status', 'confirmed')
      .neq('id', booking_id)
      .lt('start_time', newEndTime)
      .gt('end_time', new_start_time)

    if (conflicts && conflicts.length > 0) {
      return new Response(JSON.stringify({ error: 'This time slot has already been booked' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Get booking members
    const { data: bookingMembers } = await supabase
      .from('booking_members')
      .select('team_member_id')
      .eq('booking_id', booking_id)

    const memberIds = (bookingMembers || []).map((m: any) => m.team_member_id)

    const { data: teamMembers } = await supabase
      .from('employees')
      .select('id, name, email')
      .in('id', memberIds)
      .eq('active', true)

    // 4. Delete old Google Calendar event
    if (booking.google_calendar_event_id) {
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
            { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (delRes.ok || delRes.status === 410) {
            console.log('Old calendar event deleted')
            break
          }
        } catch (err) {
          console.error(`Calendar delete error for member ${memberId}:`, err)
        }
      }
    }

    // 5. Generate new cancel token and update booking
    const newCancelToken = crypto.randomUUID()

    await supabase.from('bookings').update({
      start_time: new_start_time,
      end_time: newEndTime,
      cancel_token: newCancelToken,
      google_calendar_event_id: null,
      meet_link: null,
    }).eq('id', booking_id)

    // 6. Create new Google Calendar event
    let meetLink: string | null = null
    let calendarEventId: string | null = null
    const eventType = booking.event_types
    const meetingTitle = eventType ? eventType.title : `${duration} min meeting`

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
          summary: `${meetingTitle} — ${booking.guest_name}${booking.guest_company ? ` (${booking.guest_company})` : ''}`,
          description: `Rescheduled via naviosolutions.com\n\nGuest: ${booking.guest_name}\nEmail: ${booking.guest_email}${booking.guest_company ? `\nCompany: ${booking.guest_company}` : ''}${booking.guest_message ? `\nNote: ${booking.guest_message}` : ''}`,
          start: { dateTime: new_start_time, timeZone: 'UTC' },
          end: { dateTime: newEndTime, timeZone: 'UTC' },
          attendees: [
            ...(teamMembers || []).map((m: any) => ({ email: m.email })),
            { email: booking.guest_email },
          ],
          conferenceData: {
            createRequest: {
              requestId: `navio-resched-${booking_id}-${Date.now()}`,
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

          await supabase.from('bookings').update({
            google_calendar_event_id: calendarEventId,
            meet_link: meetLink,
          }).eq('id', booking_id)

          break
        }
      } catch (err) {
        console.error(`Calendar error for ${member.email}:`, err)
      }
    }

    // 7. Send rescheduled confirmation email
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      try {
        const startDate = new Date(new_start_time)
        const formattedDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          timeZone: booking.guest_timezone,
        })
        const formattedTime = startDate.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          timeZone: booking.guest_timezone,
        })

        const manageUrl = `https://naviosolutions.com/book/manage/${booking_id}?token=${newCancelToken}`
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
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">Meeting Rescheduled 🔄</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="color:#333;font-size:16px;line-height:1.5;margin:0 0 24px">
            Hi ${booking.guest_name},<br/><br/>Your meeting has been rescheduled. Here are the updated details:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">📅 New Date</strong><br/><span style="color:#555">${formattedDate}</span></td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">🕐 New Time</strong><br/><span style="color:#555">${formattedTime} (${booking.guest_timezone})</span></td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">📋 Meeting</strong><br/><span style="color:#555">${meetingTitle} (${duration} min)</span></td></tr>
            ${teamNames ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee"><strong style="color:#1a1a5e">👥 With</strong><br/><span style="color:#555">${teamNames}</span></td></tr>` : ''}
            ${meetSection}
          </table>
          <p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 24px">
            You'll receive an updated Google Calendar invite at <strong>${booking.guest_email}</strong>.
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

        const fromAddress = await getFromAddress(resendKey, 'noreply')
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [booking.guest_email],
            subject: `Meeting Rescheduled: ${meetingTitle} — ${formattedDate}`,
            html: emailHtml,
          }),
        })
        if (!emailRes.ok) {
          console.error('Resend error:', await emailRes.text())
        } else {
          console.log('Reschedule email sent to', booking.guest_email)
        }
      } catch (emailErr) {
        console.error('Failed to send reschedule email:', emailErr)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      booking: {
        id: booking_id,
        start_time: new_start_time,
        end_time: newEndTime,
        meet_link: meetLink,
        cancel_token: newCancelToken,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('reschedule-booking error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
