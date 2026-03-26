import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    // Fetch booking with token validation
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, event_types(title, duration_minutes, description)')
      .eq('id', booking_id)
      .eq('cancel_token', cancel_token)
      .single()

    if (error || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found or invalid token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get team members for this booking
    const { data: bookingMembers } = await supabase
      .from('booking_members')
      .select('team_member_id, employees(name, email)')
      .eq('booking_id', booking_id)

    return new Response(JSON.stringify({
      booking: {
        id: booking.id,
        status: booking.status,
        start_time: booking.start_time,
        end_time: booking.end_time,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_company: booking.guest_company,
        guest_message: booking.guest_message,
        guest_timezone: booking.guest_timezone,
        meet_link: booking.meet_link,
        cancelled_at: booking.cancelled_at,
        event_type: booking.event_types ? {
          title: booking.event_types.title,
          duration_minutes: booking.event_types.duration_minutes,
          description: booking.event_types.description,
        } : null,
        team_members: (bookingMembers || []).map((bm: any) => ({
          name: bm.employees?.name,
          email: bm.employees?.email,
        })),
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-booking error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
