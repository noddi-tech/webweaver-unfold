import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowLeft, CheckCircle2, Users, CalendarX2, Loader2, ArrowUpRight } from "lucide-react";
import { format, addDays, startOfDay, isBefore, isAfter, addWeeks } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { HreflangTags } from "@/components/HreflangTags";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { LanguageLink } from "@/components/LanguageLink";
import { useParams } from "react-router-dom";

const COMMON_TIMEZONES = [
  "Europe/Oslo", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Europe/Stockholm", "Europe/Helsinki", "Europe/Amsterdam",
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore",
  "Australia/Sydney", "Pacific/Auckland",
];

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

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
  image_url: string | null;
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

function wallClockToUTC(date: Date, hours: number, minutes: number, timezone: string): Date {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const dtStr = `${year}-${month}-${day}T${h}:${m}:00`;

  const tempDate = new Date(dtStr + "Z");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const utcParts = formatter.formatToParts(tempDate);
  const getP = (type: string) => parseInt(utcParts.find(p => p.type === type)?.value || "0");
  const tzDate = new Date(Date.UTC(getP("year"), getP("month") - 1, getP("day"), getP("hour") === 24 ? 0 : getP("hour"), getP("minute"), getP("second")));
  const offset = tzDate.getTime() - tempDate.getTime();

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
  const { t } = useAppTranslation();
  const { lang } = useParams<{ lang: string }>();
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
  const [serverSlots, setServerSlots] = useState<Array<{ start: string; end: string; available_members: string[] }> | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  const tomorrow = useMemo(() => addDays(startOfDay(new Date()), 1), []);
  const maxDate = useMemo(() => addWeeks(tomorrow, 4), [tomorrow]);

  // Compute which day_of_week values have availability rules
  const availableDayNumbers = useMemo(() => {
    const days = new Set(availabilityRules.map(r => r.day_of_week));
    return days;
  }, [availabilityRules]);

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
          .from("employees")
          .select("id, name, image_url, title, timezone")
          .in("id", ids)
          .eq("active", true)
          .eq("google_calendar_connected", true);
        setMembers((tm as TeamMember[]) || []);

        const { data: rules } = await supabase
          .from("availability_rules")
          .select("team_member_id, day_of_week, start_time, end_time")
          .in("team_member_id", ids);
        setAvailabilityRules((rules as AvailabilityRule[]) || []);
      });
  }, [selectedEvent]);

  // Fetch availability from edge function when date selected
  useEffect(() => {
    if (!selectedDate || !selectedEvent) return;
    setLoadingSlots(true);
    setServerSlots(null);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    supabase.functions.invoke('get-availability', {
      body: { event_type_id: selectedEvent.id, date: dateStr, timezone },
    }).then(({ data, error }) => {
      if (error) {
        console.error('get-availability error:', error);
        setServerSlots(null);
      } else {
        setServerSlots(data?.slots || []);
      }
      setLoadingSlots(false);
    });
  }, [selectedDate, selectedEvent, timezone]);

  // Use server slots when available, fall back to client-side
  const availableSlots = useMemo(() => {
    if (serverSlots !== null) {
      return serverSlots.map(s => new Date(s.start));
    }

    // Fallback: client-side slot generation (when edge function not available)
    if (!selectedDate || !selectedEvent || !members.length) return [];

    const jsDay = selectedDate.getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1;
    const duration = selectedEvent.duration_minutes || 30;
    const buffer = selectedEvent.buffer_minutes || 0;
    const requiresAll = selectedEvent.requires_all_members || false;

    const memberWindows = members.map(m => {
      const rule = availabilityRules.find(
        r => r.team_member_id === m.id && r.day_of_week === dbDay
      );
      return { memberId: m.id, timezone: m.timezone, rule };
    });

    if (requiresAll && memberWindows.some(w => !w.rule)) return [];
    const membersWithRules = memberWindows.filter(w => w.rule);
    if (!membersWithRules.length) return [];

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

      const memberTz = membersWithRules[0].timezone || "Europe/Oslo";
      const slotUTC = wallClockToUTC(selectedDate, slotHour, slotMin, memberTz);

      if (isBefore(slotUTC, now)) continue;

      const slotEnd = new Date(slotUTC.getTime() + duration * 60000);

      const overlaps = existingBookings.some(b => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        return slotUTC.getTime() < bEnd && slotEnd.getTime() > bStart;
      });

      if (!overlaps) {
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
  }, [selectedDate, selectedEvent, members, availabilityRules, existingBookings, serverSlots]);

  const handleSubmit = async (data: BookingFormData) => {
    if (!selectedSlot || !selectedEvent) return;
    setSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('create-booking', {
        body: {
          event_type_id: selectedEvent.id,
          start_time: selectedSlot.toISOString(),
          guest_name: data.name,
          guest_email: data.email,
          guest_company: data.company || null,
          guest_message: data.message || null,
          guest_timezone: timezone,
        },
      });

      if (error) throw error;

      if (result?.error) {
        // 409 conflict or other server error
        throw new Error(result.error);
      }

      setBookingResult(result.booking);
      setStep(4);
    } catch (err: any) {
      const msg = err?.message || '';
      const is409 = msg.includes('already been booked') || msg.includes('slot');
      toast({
        variant: "destructive",
        title: is409
          ? t('book.error_slot_taken_title', 'That time slot was just booked by someone else.')
          : t('book.error_booking_failed', 'Booking failed'),
        description: is409
          ? t('book.error_slot_taken_desc', 'Please pick another time.')
          : msg,
      });
      setSelectedSlot(null);
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedEvent(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setMembers([]);
    form.reset();
    setBookingResult(null);
  };

  // Calendar disabled logic: past, future, and days with no availability rules
  const isDateDisabled = (date: Date) => {
    if (isBefore(date, tomorrow) || isAfter(date, maxDate)) return true;
    // Disable days with no availability rules (e.g. weekends)
    if (availabilityRules.length > 0) {
      const jsDay = date.getDay();
      const dbDay = jsDay === 0 ? 6 : jsDay - 1;
      if (!availableDayNumbers.has(dbDay)) return true;
    }
    return false;
  };

  // SEO meta tags
  useEffect(() => {
    document.title = "Book a Meeting — Navio Solutions";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Schedule a demo or meeting with the Navio team. See available times and book directly into our calendar.');
    return () => { document.title = 'Navio Solutions'; };
  }, []);

  return (
    <>
      <HreflangTags pageSlug="/book" />
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <LanguageLink to="/" className="text-xl font-bold text-foreground font-[var(--font-primary)]">
            Navio
          </LanguageLink>
          <LanguageLink to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('book.back_to_site', 'Back to site')}
          </LanguageLink>
        </div>
      </header>

      <div className="min-h-screen bg-background animate-fade-in pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Page heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-[var(--font-primary)]">
              {t('book.title', 'Book a Meeting')}
            </h1>
            <p className="text-muted-foreground">
              {t('book.subtitle', 'Select a meeting type to schedule time with our team.')}
            </p>
          </div>

        <StepIndicator current={step} />

        {/* Step 1: Event Type Selection */}
        <div className={`transition-all duration-300 ${step === 1 ? "opacity-100" : "opacity-0 hidden"}`}>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-5 border-l-4 border-l-muted">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : eventTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <CalendarX2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('book.no_events_title', "We're not accepting bookings at the moment.")}
              </h3>
              <p className="text-muted-foreground">
                {t('book.no_events_desc', 'Please reach out to')}{' '}
                <a href="mailto:hello@noddi.tech" className="text-primary hover:underline">hello@noddi.tech</a>
              </p>
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
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
              {/* Left info panel */}
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep(1); setSelectedDate(undefined); setSelectedSlot(null); }}
                  className="mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> {t('book.back', 'Back')}
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
                            {m.image_url && <AvatarImage src={m.image_url} />}
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
                {members.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-8 rounded-lg bg-muted/50 border border-border text-center">
                    <CalendarX2 className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        {t('book.calendar_not_ready_title', 'Calendar not yet available')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('book.calendar_not_ready_desc', 'Please contact us directly at')}{' '}
                        <a href="mailto:hello@noddi.tech" className="text-primary hover:underline">hello@noddi.tech</a>
                      </p>
                    </div>
                  </div>
                ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                  disabled={isDateDisabled}
                  className="rounded-lg border bg-card-background p-4 pointer-events-auto w-full [&_table]:w-full [&_.rdp-head_row]:flex [&_.rdp-head_row]:w-full [&_.rdp-row]:flex [&_.rdp-row]:w-full [&_.rdp-head_cell]:flex-1 [&_.rdp-cell]:flex-1 [&_.rdp-day]:w-full [&_.rdp-day]:h-11"
                />

                {/* Timezone */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">{t('book.timezone', 'Timezone')}</label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-card-background">
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
                      {t('book.available_times', 'Available times for')} {format(selectedDate, "EEEE, MMMM d")}
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
                          {t('book.no_available_times', 'No available times on this date. Please try another day.')}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSlots.map((slot, i) => {
                          const isSelected = selectedSlot?.getTime() === slot.getTime();
                          const serverSlot = serverSlots?.[i];
                          const showMembers = serverSlot && !selectedEvent?.requires_all_members && serverSlot.available_members?.length > 0 && serverSlot.available_members.length < members.length;
                          const memberNames = showMembers
                            ? serverSlot.available_members.map(id => members.find(m => m.id === id)?.name?.split(' ')[0]).filter(Boolean).join(', ')
                            : null;
                          return (
                            <button
                              key={i}
                              onClick={() => { setSelectedSlot(slot); setStep(3); }}
                              className={`min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card-background text-foreground border-border hover:border-primary hover:bg-primary/5"
                              }`}
                            >
                              {formatSlotTime(slot, timezone)}
                              {memberNames && (
                                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                                  with {memberNames}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                <ArrowLeft className="w-4 h-4 mr-1" /> {t('book.back', 'Back')}
              </Button>

              <div className="mb-6 p-4 rounded-lg bg-card-surface/30 border border-border">
                <p className="font-semibold text-foreground">{selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedSlot, "EEEE, MMMM d, yyyy")} · {formatSlotTime(selectedSlot, timezone)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{timezone.replace(/_/g, " ")}</p>
              </div>

              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_name', 'Name')} *</label>
                  <Input
                    {...form.register("name")}
                    placeholder={t('book.form_name_placeholder', 'Your full name')}
                    className="bg-card-background min-h-[44px]"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_email', 'Email')} *</label>
                  <Input
                    {...form.register("email")}
                    placeholder={t('book.form_email_placeholder', 'you@company.com')}
                    className="bg-card-background min-h-[44px]"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_company', 'Company')}</label>
                  <Input
                    {...form.register("company")}
                    placeholder={t('book.form_company_placeholder', 'Your company name')}
                    className="bg-card-background min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    {t('book.form_message', "Anything you'd like us to know?")}
                  </label>
                  <Textarea
                    {...form.register("message")}
                    placeholder={t('book.form_message_placeholder', 'Optional message...')}
                    rows={3}
                    className="bg-card-background"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[44px]"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('book.confirming', 'Confirming...')}
                    </>
                  ) : (
                    t('book.confirm_booking', 'Confirm Booking')
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Step 4: Confirmation */}
        <div className={`transition-all duration-300 ${step === 4 ? "opacity-100" : "opacity-0 hidden"}`}>
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('book.confirmed_title', 'Meeting confirmed!')}</h2>
            <p className="text-muted-foreground mb-6">
              {bookingResult?.meet_link
                ? t('book.confirmed_invite_sent', 'A calendar invite has been sent to your email.')
                : t('book.confirmed_invite_shortly', "Meeting confirmed! We'll send you a calendar invite shortly.")}
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
                {bookingResult.meet_link && (
                  <a
                    href={bookingResult.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    🎥 {t('book.join_meet', 'Join Google Meet')}
                  </a>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-6">
              {t('book.calendar_invite_note', "You'll receive a Google Calendar invite at")}{' '}
              <span className="font-medium text-foreground">{form.getValues('email')}</span>{' '}
              {t('book.within_minutes', 'within a few minutes.')}
            </p>

            <Button variant="ghost" onClick={reset}>
              {t('book.book_another', 'Book another meeting')}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
