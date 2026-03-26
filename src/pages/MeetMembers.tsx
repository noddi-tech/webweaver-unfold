import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowLeft, CheckCircle2, Users, CalendarX2, Loader2 } from "lucide-react";
import { format, addDays, startOfDay, isBefore, isAfter, addWeeks } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { HreflangTags } from "@/components/HreflangTags";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { LanguageLink } from "@/components/LanguageLink";

const COMMON_TIMEZONES = [
  "Europe/Oslo", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Europe/Stockholm", "Europe/Helsinki", "Europe/Amsterdam",
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore",
  "Australia/Sydney", "Pacific/Auckland",
];

const DURATION_OPTIONS = [15, 30, 45, 60];

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

type TeamMember = {
  id: string;
  name: string;
  image_url: string | null;
  title: string | null;
  timezone: string;
  slug: string | null;
};

type AvailabilityRule = {
  team_member_id: string;
  day_of_week: number;
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatSlotTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  }).format(date);
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map(step => (
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

export default function MeetMembers() {
  const { t } = useAppTranslation();
  const { lang, memberSlugs } = useParams<{ lang: string; memberSlugs: string }>();
  const slugs = useMemo(() => (memberSlugs || "").split(",").map(s => s.trim()).filter(Boolean), [memberSlugs]);

  const [step, setStep] = useState(1); // 1=calendar, 2=form, 3=confirmed
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);

  const [serverSlots, setServerSlots] = useState<Array<{ start: string; end: string }> | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  const tomorrow = useMemo(() => addDays(startOfDay(new Date()), 1), []);
  const maxDate = useMemo(() => addWeeks(tomorrow, 4), [tomorrow]);

  const availableDayNumbers = useMemo(() => {
    return new Set(availabilityRules.map(r => r.day_of_week));
  }, [availabilityRules]);

  // Fetch members by slug
  useEffect(() => {
    if (!slugs.length) { setNotFound(true); setLoading(false); return; }

    supabase
      .from("employees")
      .select("id, name, image_url, title, timezone, slug")
      .in("slug", slugs)
      .eq("active", true)
      .eq("google_calendar_connected", true)
      .then(async ({ data }) => {
        if (!data?.length) { setNotFound(true); setLoading(false); return; }
        setMembers(data as TeamMember[]);

        // Fetch availability rules for calendar disabled logic
        const ids = data.map(m => m.id);
        const { data: rules } = await supabase
          .from("availability_rules")
          .select("team_member_id, day_of_week")
          .in("team_member_id", ids);
        setAvailabilityRules((rules as AvailabilityRule[]) || []);
        setLoading(false);
      });
  }, [slugs]);

  // Fetch slots from edge function when date selected
  useEffect(() => {
    if (!selectedDate || !members.length) return;
    setLoadingSlots(true);
    setServerSlots(null);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    supabase.functions.invoke('get-member-availability', {
      body: {
        member_ids: members.map(m => m.id),
        date: dateStr,
        duration: selectedDuration,
      },
    }).then(({ data, error }) => {
      if (error) {
        console.error('get-member-availability error:', error);
        setServerSlots([]);
      } else {
        setServerSlots(data?.slots || []);
      }
      setLoadingSlots(false);
    });
  }, [selectedDate, members, selectedDuration]);

  const availableSlots = useMemo(() => {
    if (!serverSlots) return [];
    return serverSlots.map(s => new Date(s.start));
  }, [serverSlots]);

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, tomorrow) || isAfter(date, maxDate)) return true;
    const jsDay = date.getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1;
    // Only enable days where ALL members have availability
    if (availabilityRules.length > 0 && !availableDayNumbers.has(dbDay)) return true;
    return false;
  };

  const handleSubmit = async (data: BookingFormData) => {
    if (!selectedSlot) return;
    setSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('create-booking', {
        body: {
          member_ids: members.map(m => m.id),
          start_time: selectedSlot.toISOString(),
          guest_name: data.name,
          guest_email: data.email,
          guest_company: data.company || null,
          guest_message: data.message || null,
          guest_timezone: timezone,
          duration_minutes: selectedDuration,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setBookingResult(result.booking);
      setStep(3);
    } catch (err: any) {
      const msg = err?.message || '';
      toast({
        variant: "destructive",
        title: msg.includes('already been booked') ? 'That time slot was just booked.' : 'Booking failed',
        description: msg.includes('already been booked') ? 'Please pick another time.' : msg,
      });
      setSelectedSlot(null);
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const memberNames = members.map(m => m.name.split(' ')[0]);
  const headerTitle = memberNames.length === 1
    ? `Book a meeting with ${memberNames[0]}`
    : `Book a meeting with ${memberNames.slice(0, -1).join(', ')} & ${memberNames[memberNames.length - 1]}`;

  // SEO
  useEffect(() => {
    document.title = `${headerTitle} — Navio Solutions`;
    return () => { document.title = 'Navio Solutions'; };
  }, [headerTitle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <LanguageLink to="/" className="text-xl font-bold text-foreground font-[var(--font-primary)]">Navio</LanguageLink>
            <LanguageLink to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to site
            </LanguageLink>
          </div>
        </header>
        <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
          <div className="text-center">
            <CalendarX2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Team member not found</h1>
            <p className="text-muted-foreground">The meeting link may be invalid or the team member is unavailable.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HreflangTags pageSlug={`/meet/${memberSlugs}`} />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <LanguageLink to="/" className="text-xl font-bold text-foreground font-[var(--font-primary)]">Navio</LanguageLink>
          <LanguageLink to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('book.back_to_site', 'Back to site')}
          </LanguageLink>
        </div>
      </header>

      <div className="min-h-screen bg-background animate-fade-in pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[var(--font-primary)]">
              {headerTitle}
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    {m.image_url && <AvatarImage src={m.image_url} />}
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">{getInitials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    {m.title && <p className="text-xs text-muted-foreground">{m.title}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <StepIndicator current={step} total={3} />

          {/* Step 1: Duration + Calendar + Slots */}
          <div className={`transition-all duration-300 ${step === 1 ? "opacity-100" : "opacity-0 hidden"}`}>
            <div className="space-y-6">
              {/* Duration picker */}
              <div>
                <label className="text-xs text-muted-foreground block mb-2">
                  {t('book.choose_duration', 'How long do you need?')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDuration(d); setSelectedSlot(null); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedDuration === d
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card-background text-foreground border-border hover:border-primary"
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                disabled={isDateDisabled}
                className="rounded-lg border bg-card-background p-4 pointer-events-auto w-full"
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
                        return (
                          <button
                            key={i}
                            onClick={() => { setSelectedSlot(slot); setStep(2); }}
                            className={`min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card-background text-foreground border-border hover:border-primary hover:bg-primary/5"
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

          {/* Step 2: Booking Form */}
          <div className={`transition-all duration-300 ${step === 2 ? "opacity-100" : "opacity-0 hidden"}`}>
            {selectedSlot && (
              <div className="max-w-md mx-auto">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-1" /> {t('book.back', 'Back')}
                </Button>

                <div className="mb-6 p-4 rounded-lg bg-card-surface/30 border border-border">
                  <p className="font-semibold text-foreground">{selectedDuration} min meeting</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedSlot, "EEEE, MMMM d, yyyy")} · {formatSlotTime(selectedSlot, timezone)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{timezone.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    with {members.map(m => m.name).join(', ')}
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_name', 'Name')} *</label>
                    <Input {...form.register("name")} placeholder={t('book.form_name_placeholder', 'Your full name')} className="bg-card-background min-h-[44px]" />
                    {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_email', 'Email')} *</label>
                    <Input {...form.register("email")} placeholder={t('book.form_email_placeholder', 'you@company.com')} className="bg-card-background min-h-[44px]" />
                    {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_company', 'Company')}</label>
                    <Input {...form.register("company")} placeholder={t('book.form_company_placeholder', 'Your company name')} className="bg-card-background min-h-[44px]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">{t('book.form_message', "Anything you'd like us to know?")}</label>
                    <Textarea {...form.register("message")} placeholder={t('book.form_message_placeholder', 'Optional message...')} rows={3} className="bg-card-background" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full min-h-[44px]" size="lg">
                    {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('book.confirming', 'Confirming...')}</>) : t('book.confirm_booking', 'Confirm Booking')}
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Step 3: Confirmation */}
          <div className={`transition-all duration-300 ${step === 3 ? "opacity-100" : "opacity-0 hidden"}`}>
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

              {bookingResult && (
                <div className="p-4 rounded-lg bg-card-surface/30 border border-border text-left mb-8">
                  <p className="font-semibold text-foreground">{selectedDuration} min meeting</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSlot && format(selectedSlot, "EEEE, MMMM d, yyyy")} · {selectedSlot && formatSlotTime(selectedSlot, timezone)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{timezone.replace(/_/g, " ")}</p>
                  {bookingResult.meet_link && (
                    <a href={bookingResult.meet_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                      Join Google Meet
                    </a>
                  )}
                </div>
              )}

              <LanguageLink to="/">
                <Button variant="outline">{t('book.back_home', 'Back to homepage')}</Button>
              </LanguageLink>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
