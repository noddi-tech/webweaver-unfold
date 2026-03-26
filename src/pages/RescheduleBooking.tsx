import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowLeft, CheckCircle2, CalendarX2, Loader2, XCircle, AlertTriangle } from "lucide-react";
import { format, addDays, startOfDay, isBefore, isAfter, addWeeks } from "date-fns";

const SUPABASE_URL = "https://ouhfgazomdmirdazvjys.supabase.co";

const COMMON_TIMEZONES = [
  "Europe/Oslo", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Europe/Stockholm", "Europe/Helsinki", "Europe/Amsterdam",
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore",
  "Australia/Sydney", "Pacific/Auckland",
];

function formatSlotTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  }).format(date);
}

interface BookingDetails {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  guest_email: string;
  guest_company: string | null;
  guest_message: string | null;
  guest_timezone: string;
  meet_link: string | null;
  event_type: {
    title: string;
    duration_minutes: number;
    description: string | null;
  } | null;
  team_members: { name: string; email: string }[];
}

type PageState = 'loading' | 'scheduling' | 'confirming' | 'success' | 'not_found' | 'error';

const RescheduleBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState('');

  // Scheduling state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [serverSlots, setServerSlots] = useState<Array<{ start: string; end: string }> | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Member IDs for availability
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<{ day_of_week: number }[]>([]);

  const tomorrow = useMemo(() => addDays(startOfDay(new Date()), 1), []);
  const maxDate = useMemo(() => addWeeks(tomorrow, 4), [tomorrow]);

  const duration = useMemo(() => {
    if (!booking) return 30;
    if (booking.event_type?.duration_minutes) return booking.event_type.duration_minutes;
    return Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000);
  }, [booking]);

  const availableDayNumbers = useMemo(() => new Set(availabilityRules.map(r => r.day_of_week)), [availabilityRules]);

  useEffect(() => {
    document.title = 'Reschedule Meeting — Navio Solutions';
  }, []);

  // Fetch booking details
  useEffect(() => {
    if (!bookingId || !token) { setState('not_found'); return; }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId, cancel_token: token }),
        });

        if (!res.ok) { setState('not_found'); return; }

        const data = await res.json();
        const b = data.booking as BookingDetails;

        if (b.status === 'cancelled') { setState('not_found'); return; }

        setBooking(b);
        setTimezone(b.guest_timezone);

        // Get member IDs from team_members emails
        const { data: employees } = await supabase
          .from('employees')
          .select('id')
          .in('email', b.team_members.map(m => m.email))
          .eq('active', true);

        const ids = (employees || []).map(e => e.id);
        setMemberIds(ids);

        // Fetch availability rules
        if (ids.length > 0) {
          const { data: rules } = await supabase
            .from('availability_rules')
            .select('day_of_week')
            .in('team_member_id', ids);
          setAvailabilityRules((rules || []) as { day_of_week: number }[]);
        }

        setState('scheduling');
      } catch {
        setState('error');
        setError('Failed to load booking details.');
      }
    };

    fetchBooking();
  }, [bookingId, token]);

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate || !memberIds.length) return;
    setLoadingSlots(true);
    setServerSlots(null);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    supabase.functions.invoke('get-member-availability', {
      body: { member_ids: memberIds, date: dateStr, duration },
    }).then(({ data, error }) => {
      if (error) {
        console.error('Availability error:', error);
        setServerSlots([]);
      } else {
        setServerSlots(data?.slots || []);
      }
      setLoadingSlots(false);
    });
  }, [selectedDate, memberIds, duration]);

  const availableSlots = useMemo(() => {
    if (!serverSlots) return [];
    return serverSlots.map(s => new Date(s.start));
  }, [serverSlots]);

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, tomorrow) || isAfter(date, maxDate)) return true;
    const jsDay = date.getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1;
    if (availabilityRules.length > 0 && !availableDayNumbers.has(dbDay)) return true;
    return false;
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !bookingId || !token) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/reschedule-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          cancel_token: token,
          new_start_time: selectedSlot.toISOString(),
          duration_minutes: duration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reschedule');
        if (data.error?.includes('already been booked')) {
          setSelectedSlot(null);
        } else {
          setState('error');
        }
        return;
      }

      setResult(data.booking);
      setState('success');
    } catch {
      setError('Network error. Please try again.');
      setState('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-primary">Navio</a>
          {state === 'scheduling' && booking && (
            <a
              href={`/book/manage/${bookingId}?token=${token}`}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to booking
            </a>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        )}

        {state === 'not_found' && (
          <div className="text-center py-20">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground">This booking doesn't exist, has been cancelled, or the link is invalid.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Something Went Wrong</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {state === 'success' && result && (
          <div className="text-center py-20">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Meeting Rescheduled!</h1>
            <p className="text-muted-foreground mb-6">
              Your meeting has been moved. A new calendar invite has been sent to your email.
            </p>
            {selectedSlot && (
              <div className="inline-block p-4 rounded-lg bg-white/80 border border-border/50 text-left mb-6">
                <p className="font-semibold text-foreground">
                  {booking?.event_type?.title || `${duration} min meeting`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedSlot, "EEEE, MMMM d, yyyy")} · {formatSlotTime(selectedSlot, timezone)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{timezone.replace(/_/g, " ")}</p>
                {result.meet_link && (
                  <a href={result.meet_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                    Join Google Meet
                  </a>
                )}
              </div>
            )}
            <div>
              <a href={`/book/manage/${bookingId}?token=${result.cancel_token}`}>
                <Button variant="outline">View Updated Booking</Button>
              </a>
            </div>
          </div>
        )}

        {(state === 'scheduling' || state === 'confirming') && booking && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Reschedule: {booking.event_type?.title || 'Meeting'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {duration} minutes · with {booking.team_members.map(m => m.name).join(', ')}
              </p>
            </div>

            {/* Confirm selection */}
            {state === 'confirming' && selectedSlot && (
              <div className="bg-white/80 border border-border/50 rounded-xl p-6 space-y-4 backdrop-blur-sm">
                <h2 className="font-semibold text-foreground">Confirm new time</h2>
                <p className="text-foreground">
                  {format(selectedSlot, "EEEE, MMMM d, yyyy")} · {formatSlotTime(selectedSlot, timezone)}
                </p>
                <p className="text-sm text-muted-foreground">{timezone.replace(/_/g, " ")}</p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedSlot(null); setState('scheduling'); }}
                    className="flex-1 min-h-[44px]"
                  >
                    Pick another time
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="flex-1 min-h-[44px]"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rescheduling...</>
                    ) : (
                      'Confirm Reschedule'
                    )}
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )}

            {/* Calendar + Slots */}
            {state === 'scheduling' && (
              <>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                  disabled={isDateDisabled}
                  className="rounded-lg border bg-white/80 p-4 pointer-events-auto w-full"
                />

                {/* Timezone */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Timezone</label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                      Available times for {format(selectedDate, "EEEE, MMMM d")}
                    </p>
                    {loadingSlots ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <Skeleton key={i} className="h-11 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                        <CalendarX2 className="w-5 h-5 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          No available times on this date. Please try another day.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSlots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedSlot(slot); setState('confirming'); setError(''); }}
                            className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium transition-all border bg-white/80 text-foreground border-border hover:border-primary hover:bg-primary/5"
                          >
                            {formatSlotTime(slot, timezone)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RescheduleBooking;
