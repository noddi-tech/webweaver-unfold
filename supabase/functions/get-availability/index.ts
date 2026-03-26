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
  // Check if token is still valid (with 5 min buffer)
  if (new Date(tokenRow.token_expiry) > new Date(Date.now() + 5 * 60 * 1000)) {
    return await decrypt(tokenRow.access_token_encrypted, encKey)
  }

  // Refresh the token
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

  // Update stored token
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
    const { event_type_id, date, timezone } = await req.json()

    if (!event_type_id || !date) {
      return new Response(JSON.stringify({ error: 'Missing event_type_id or date' }), {
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
    const { data: eventType, error: etError } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', event_type_id)
      .single()

    if (etError || !eventType) {
      return new Response(JSON.stringify({ error: 'Event type not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Get assigned members
    const { data: etMembers } = await supabase
      .from('event_type_members')
      .select('team_member_id, is_required')
      .eq('event_type_id', event_type_id)

    if (!etMembers?.length) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const memberIds = etMembers.map((m: any) => m.team_member_id)

    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id, name, email, timezone')
      .in('id', memberIds)
      .eq('is_active', true)

    if (!teamMembers?.length) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Get availability rules for the day
    const dateObj = new Date(date + 'T12:00:00Z')
    const jsDay = dateObj.getUTCDay()
    const dbDay = jsDay === 0 ? 6 : jsDay - 1 // Convert to Monday=0 format

    const { data: rules } = await supabase
      .from('availability_rules')
      .select('*')
      .in('team_member_id', memberIds)
      .eq('day_of_week', dbDay)

    if (!rules?.length) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Get existing bookings for the date
    const dayStart = `${date}T00:00:00Z`
    const dayEnd = `${date}T23:59:59Z`

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('start_time, end_time, booking_members(team_member_id)')
      .eq('status', 'confirmed')
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)

    // Build busy periods per member from DB bookings
    const busyPerMember: Record<string, Array<{ start: number; end: number }>> = {}
    for (const member of teamMembers) {
      busyPerMember[member.id] = []
    }

    for (const booking of (existingBookings || [])) {
      const bStart = new Date(booking.start_time).getTime()
      const bEnd = new Date(booking.end_time).getTime()
      for (const bm of (booking.booking_members || [])) {
        if (busyPerMember[bm.team_member_id]) {
          busyPerMember[bm.team_member_id].push({ start: bStart, end: bEnd })
        }
      }
    }

    // 5. Query Google Calendar FreeBusy for connected members
    for (const member of teamMembers) {
      const { data: tokenRow } = await supabase
        .from('google_oauth_tokens')
        .select('*')
        .eq('team_member_id', member.id)
        .single()

      if (!tokenRow) continue

      try {
        const accessToken = await getAccessToken(supabase, tokenRow, encKey)
        const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeMin: dayStart,
            timeMax: dayEnd,
            timeZone: 'UTC',
            items: [{ id: member.email }],
          }),
        })
        const fbData = await fbRes.json()
        const busy = fbData.calendars?.[member.email]?.busy || []
        for (const b of busy) {
          busyPerMember[member.id].push({
            start: new Date(b.start).getTime(),
            end: new Date(b.end).getTime(),
          })
        }
      } catch (err) {
        console.error(`FreeBusy error for ${member.email}:`, err)
        // Continue without Google Calendar data
      }
    }

    // 6. Generate slots
    const duration = eventType.duration_minutes || 30
    const buffer = eventType.buffer_minutes || 0
    const requiresAll = eventType.requires_all_members || false
    const now = Date.now()

    // Build member availability windows
    const memberWindows = teamMembers.map((m: any) => {
      const rule = rules.find((r: any) => r.team_member_id === m.id)
      const etm = etMembers.find((e: any) => e.team_member_id === m.id)
      return { id: m.id, timezone: m.timezone || 'Europe/Oslo', rule, isRequired: etm?.is_required || false }
    })

    if (requiresAll && memberWindows.some(w => !w.rule)) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const membersWithRules = memberWindows.filter(w => w.rule)
    if (!membersWithRules.length) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Helper: convert wall clock time to UTC timestamp for a given date and timezone
    function wallClockToUTC(dateStr: string, hours: number, minutes: number, tz: string): number {
      const dtStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      // Use Intl to compute the offset
      const tempDate = new Date(dtStr + 'Z')
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })
      const parts = formatter.formatToParts(tempDate)
      const getP = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0')
      const tzDate = new Date(Date.UTC(getP('year'), getP('month') - 1, getP('day'), getP('hour') === 24 ? 0 : getP('hour'), getP('minute'), getP('second')))
      const offset = tzDate.getTime() - tempDate.getTime()
      return new Date(dtStr + 'Z').getTime() - offset
    }

    function timeToMinutes(time: string): number {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }

    // Calculate the slot window
    const allStarts = membersWithRules.map(w => timeToMinutes(w.rule.start_time))
    const allEnds = membersWithRules.map(w => timeToMinutes(w.rule.end_time))

    const windowStart = requiresAll ? Math.max(...allStarts) : Math.min(...allStarts)
    const windowEnd = requiresAll ? Math.min(...allEnds) : Math.max(...allEnds)

    const slots: Array<{ start: string; end: string; available_members: string[] }> = []

    if (windowStart < windowEnd) {
      for (let t = windowStart; t + duration <= windowEnd; t += duration + buffer) {
        const slotHour = Math.floor(t / 60)
        const slotMin = t % 60

        // Use first member's timezone for slot generation
        const memberTz = membersWithRules[0].timezone
        const slotStartMs = wallClockToUTC(date, slotHour, slotMin, memberTz)
        const slotEndMs = slotStartMs + duration * 60000

        // Skip past slots
        if (slotStartMs < now) continue

        // Check which members are available
        const availableMembers: string[] = []
        for (const w of membersWithRules) {
          const mStart = timeToMinutes(w.rule.start_time)
          const mEnd = timeToMinutes(w.rule.end_time)
          if (t < mStart || t + duration > mEnd) continue

          // Check busy periods
          const isBusy = (busyPerMember[w.id] || []).some(b =>
            slotStartMs < b.end && slotEndMs > b.start
          )
          if (!isBusy) availableMembers.push(w.id)
        }

        if (requiresAll) {
          if (availableMembers.length === membersWithRules.length) {
            slots.push({
              start: new Date(slotStartMs).toISOString(),
              end: new Date(slotEndMs).toISOString(),
              available_members: availableMembers,
            })
          }
        } else {
          if (availableMembers.length > 0) {
            slots.push({
              start: new Date(slotStartMs).toISOString(),
              end: new Date(slotEndMs).toISOString(),
              available_members: availableMembers,
            })
          }
        }
      }
    }

    return new Response(JSON.stringify({ slots }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-availability error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
