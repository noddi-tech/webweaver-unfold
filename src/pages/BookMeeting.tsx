import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ArrowLeft, CheckCircle2, Users } from "lucide-react";
import { format, addDays, startOfDay, isBefore, isAfter, addWeeks, setHours, setMinutes } from "date-fns";

const COMMON_TIMEZONES = [
  "Europe/Oslo", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Europe/Stockholm", "Europe/Helsinki", "Europe/Amsterdam",
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore",
  "Australia/Sydney", "Pacific/Auckland",
];

type EventType = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  buffer_minutes: number | null;
  color: string | null;
  requires_all_members: boolean | null;
};

type TeamMember = {
  id: string;
  name: string;
  avatar_url: string | null;
  title: string | null;
  timezone: string;
};

type AvailabilityRule = {
  team_member_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Booking = {
  start_time: string;
  end_time: string;
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatSlotTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  }).format(date);
}

// Convert a "wall clock" time on a given date in a given timezone to a UTC Date
function wallClockToUTC(date: Date, hours: number, minutes: number, timezone: string): Date {
  // Build an ISO-ish string in the target timezone then parse
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const dtStr = `${year}-${month}-${day}T${h}:${m}:00`;

  // Use Intl to find the offset for this timezone at this datetime
  const tempDate = new Date(dtStr + "Z");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  // Iterative approach: find offset
  const utcParts = formatter.formatToParts(tempDate);
  const getP = (type: string) => parseInt(utcParts.find(p => p.type === type)?.value || "0");
  const tzDate = new Date(Date.UTC(getP("year"), getP("month") - 1, getP("day"), getP("hour") === 24 ? 0 : getP("hour"), getP("minute"), getP("second")));
  const offset = tzDate.getTime() - tempDate.getTime();

  // The actual UTC time for the wall clock time in the target TZ
  const target = new Date(dtStr + "Z");
  return new Date(target.getTime() - offset);
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            step === current
              ? "bg-primary scale-125"
              : step < current
              ? "bg-primary/50"
              : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function BookMeeting() {
  const [step, setStep] = useState(1);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timezone, setTimezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tomorrow = useMemo(() => addDays(startOfDay(new Date()), 1), []);
  const maxDate = useMemo(() => addWeeks(tomorrow, 4), [tomorrow]);

  // Fetch event types
  useEffect(() => {
    supabase
      .from("event_types")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => {
        setEventTypes((data as EventType[]) || []);
        setLoading(false);
      });
  }, []);

  // Fetch members when event selected
  useEffect(() => {
    if (!selectedEvent) return;
    supabase
      .from("event_type_members")
      .select("team_member_id, is_required")
      .eq("event_type_id", selectedEvent.id)
      .then(async ({ data: etm }) => {
        if (!etm?.length) return;
        const ids = etm.map(e => e.team_member_id);
        const { data: tm } = await supabase
          .from("team_members")
          .select("id, name, avatar_url, title, timezone")
          .in("id", ids)
          .eq("is_active", true);
        setMembers((tm as TeamMember[]) || []);

        // Fetch availability for these members
        const { data: rules } = await supabase
          .from("availability_rules")
          .select("team_member_id, day_of_week, start_time, end_time")
          .in("team_member_id", ids);
        setAvailabilityRules((rules as AvailabilityRule[]) || []);
      });
  }, [selectedEvent]);

  // Fetch bookings for selected date
  useEffect(() => {
    if (!selectedDate || !selectedEvent) return;
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("event_type_id", selectedEvent.id)
      .eq("status", "confirmed")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString())
      .then(({ data }) => {
        setExistingBookings((data as Booking[]) || []);
      });
  }, [selectedDate, selectedEvent]);

  // Generate available slots
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedEvent || !members.length) return [];

    // day_of_week: 0=Monday in our DB. JS getDay: 0=Sunday.
    const jsDay = selectedDate.getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1;
    const duration = selectedEvent.duration_minutes || 30;
    const buffer = selectedEvent.buffer_minutes || 0;
    const requiresAll = selectedEvent.requires_all_members || false;

    // Get availability windows per member
    const memberWindows = members.map(m => {
      const rule = availabilityRules.find(
        r => r.team_member_id === m.id && r.day_of_week === dbDay
      );
      return { memberId: m.id, timezone: m.timezone, rule };
    });

    // If requires all and any member has no rule, no slots
    if (requiresAll && memberWindows.some(w => !w.rule)) return [];
    // If not requires all and no member has a rule, no slots
    const membersWithRules = memberWindows.filter(w => w.rule);
    if (!membersWithRules.length) return [];

    // Generate slots from union/intersection of windows
    // For simplicity, generate from the broadest window then filter per-member
    const allStarts = membersWithRules.map(w => timeToMinutes(w.rule!.start_time));
    const allEnds = membersWithRules.map(w => timeToMinutes(w.rule!.end_time));

    const windowStart = requiresAll ? Math.max(...allStarts) : Math.min(...allStarts);
    const windowEnd = requiresAll ? Math.min(...allEnds) : Math.max(...allEnds);

    if (windowStart >= windowEnd) return [];

    const slots: Date[] = [];
    const now = new Date();

    for (let t = windowStart; t + duration <= windowEnd; t += duration + buffer) {
      const slotHour = Math.floor(t / 60);
      const slotMin = t % 60;

      // Convert to UTC using team member timezone (use first member's tz for simplicity)
      // Since availability is in member's local TZ, we convert from Europe/Oslo
      const memberTz = membersWithRules[0].timezone || "Europe/Oslo";
      const slotUTC = wallClockToUTC(selectedDate, slotHour, slotMin, memberTz);

      // Skip past slots
      if (isBefore(slotUTC, now)) continue;

      const slotEnd = new Date(slotUTC.getTime() + duration * 60000);

      // Check against existing bookings
      const overlaps = existingBookings.some(b => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        return slotUTC.getTime() < bEnd && slotEnd.getTime() > bStart;
      });

      if (!overlaps) {
        // Check member availability for this specific slot
        if (requiresAll) {
          const allFree = memberWindows.every(w => {
            if (!w.rule) return false;
            const mStart = timeToMinutes(w.rule.start_time);
            const mEnd = timeToMinutes(w.rule.end_time);
            return t >= mStart && t + duration <= mEnd;
          });
          if (allFree) slots.push(slotUTC);
        } else {
          const anyFree = membersWithRules.some(w => {
            const mStart = timeToMinutes(w.rule!.start_time);
            const mEnd = timeToMinutes(w.rule!.end_time);
            return t >= mStart && t + duration <= mEnd;
          });
          if (anyFree) slots.push(slotUTC);
        }
      }
    }

    return slots;
  }, [selectedDate, selectedEvent, members, availabilityRules, existingBookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedEvent) return;
    setSubmitting(true);

    const duration = selectedEvent.duration_minutes || 30;
    const endTime = new Date(selectedSlot.getTime() + duration * 60000);

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        event_type_id: selectedEvent.id,
        guest_name: formData.name,
        guest_email: formData.email,
        guest_company: formData.company || null,
        guest_message: formData.message || null,
        guest_timezone: timezone,
        start_time: selectedSlot.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
      })
      .select()
      .single();

    if (booking && !error) {
      // Insert booking members
      const memberInserts = members.map(m => ({
        booking_id: booking.id,
        team_member_id: m.id,
      }));
      await supabase.from("booking_members").insert(memberInserts);

      setBookingResult(booking);
      setStep(4);
    }
    setSubmitting(false);
  };

  const reset = () => {
    setStep(1);
    setSelectedEvent(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setMembers([]);
    setFormData({ name: "", email: "", company: "", message: "" });
    setBookingResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-bold text-primary font-[var(--font-primary)]">navio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-[var(--font-primary)]">
            Book a Meeting
          </h1>
          <p className="text-muted-foreground">
            Select a meeting type to schedule time with our team.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Step 1: Event Type Selection */}
        <div className={`transition-all duration-300 ${step === 1 ? "opacity-100" : "opacity-0 hidden"}`}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {eventTypes.map(et => (
                <Card
                  key={et.id}
                  className="p-5 cursor-pointer hover:shadow-md transition-all border-l-4 bg-card-surface/30 hover:bg-card-surface/50"
                  style={{ borderLeftColor: et.color || "hsl(var(--primary))" }}
                  onClick={() => { setSelectedEvent(et); setStep(2); }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{et.title}</h3>
                      {et.description && (
                        <p className="text-sm text-muted-foreground mt-1">{et.description}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {et.duration_minutes || 30} min
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Date & Time */}
        <div className={`transition-all duration-300 ${step === 2 ? "opacity-100" : "opacity-0 hidden"}`}>
          {selectedEvent && (
            <div className="grid md:grid-cols-[280px_1fr] gap-8">
              {/* Left info panel */}
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep(1); setSelectedDate(undefined); setSelectedSlot(null); }}
                  className="mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>

                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedEvent.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {selectedEvent.duration_minutes || 30} min
                  </p>
                </div>

                {members.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Team
                    </p>
                    <div className="space-y-2">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8">
                            {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{m.name}</p>
                            {m.title && <p className="text-xs text-muted-foreground">{m.title}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Calendar + timezone + slots */}
              <div className="space-y-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                  disabled={(date) => isBefore(date, tomorrow) || isAfter(date, maxDate)}
                  className="rounded-lg border bg-white p-3 pointer-events-auto"
                />

                {/* Timezone */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Timezone</label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-white">
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
                    {availableSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No available times on this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                        {availableSlots.map((slot, i) => {
                          const isSelected = selectedSlot?.getTime() === slot.getTime();
                          return (
                            <button
                              key={i}
                              onClick={() => { setSelectedSlot(slot); setStep(3); }}
                              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-white text-foreground border-border hover:border-primary hover:bg-primary/5"
                              }`}
                            >
                              {formatSlotTime(slot, timezone)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Booking Form */}
        <div className={`transition-all duration-300 ${step === 3 ? "opacity-100" : "opacity-0 hidden"}`}>
          {selectedEvent && selectedSlot && (
            <div className="max-w-md mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(2)}
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <div className="mb-6 p-4 rounded-lg bg-card-surface/30 border border-border">
                <p className="font-semibold text-foreground">{selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedSlot, "EEEE, MMMM d, yyyy")} · {formatSlotTime(selectedSlot, timezone)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{timezone.replace(/_/g, " ")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Email *</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Company</label>
                  <Input
                    value={formData.company}
                    onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
                    placeholder="Your company name"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Anything you'd like us to know?
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                    placeholder="Optional message..."
                    rows={3}
                    className="bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? "Confirming..." : "Confirm Booking"}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Step 4: Confirmation */}
        <div className={`transition-all duration-300 ${step === 4 ? "opacity-100" : "opacity-0 hidden"}`}>
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-[scale-in_0.3s_ease-out]">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">You're booked!</h2>
            <p className="text-muted-foreground mb-6">
              A calendar invite will be sent to your email shortly.
            </p>

            {bookingResult && selectedEvent && (
              <div className="p-4 rounded-lg bg-card-surface/30 border border-border text-left mb-8">
                <p className="font-semibold text-foreground">{selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(bookingResult.start_time), "EEEE, MMMM d, yyyy")} ·{" "}
                  {formatSlotTime(new Date(bookingResult.start_time), timezone)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{timezone.replace(/_/g, " ")}</p>
                {members.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    With {members.map(m => m.name).join(" & ")}
                  </p>
                )}
              </div>
            )}

            <Button variant="ghost" onClick={reset}>
              Book another meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
