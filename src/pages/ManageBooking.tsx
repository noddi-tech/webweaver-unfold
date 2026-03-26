import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Mail, Building2, MessageSquare, Video, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  cancelled_at: string | null;
  event_type: {
    title: string;
    duration_minutes: number;
    description: string | null;
  } | null;
  team_members: { name: string; email: string }[];
}

type PageState = 'loading' | 'loaded' | 'not_found' | 'cancelled' | 'cancel_success' | 'error';

const SUPABASE_URL = "https://ouhfgazomdmirdazvjys.supabase.co";

const ManageBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Manage Booking — Navio Solutions';
  }, []);

  useEffect(() => {
    if (!bookingId || !token) {
      setState('not_found');
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId, cancel_token: token }),
        });

        if (!res.ok) {
          setState('not_found');
          return;
        }

        const data = await res.json();
        setBooking(data.booking);
        setState(data.booking.status === 'cancelled' ? 'cancelled' : 'loaded');
      } catch {
        setState('error');
      }
    };

    fetchBooking();
  }, [bookingId, token]);

  const handleCancel = async () => {
    if (!bookingId || !token) return;
    setCancelling(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/cancel-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, cancel_token: token }),
      });

      if (res.ok) {
        setState('cancel_success');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to cancel booking');
        setState('error');
      }
    } catch {
      setError('Network error. Please try again.');
      setState('error');
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (iso: string, tz: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return format(new Date(iso), 'PPPp');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-primary">Navio</a>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </a>
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
            <p className="text-muted-foreground">This booking doesn't exist or the link is invalid.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Something Went Wrong</h1>
            <p className="text-muted-foreground">{error || 'An unexpected error occurred. Please try again.'}</p>
          </div>
        )}

        {state === 'cancel_success' && (
          <div className="text-center py-20">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Meeting Cancelled</h1>
            <p className="text-muted-foreground">The team has been notified. The calendar event has been removed.</p>
          </div>
        )}

        {state === 'cancelled' && booking && (
          <div className="text-center py-20">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">This Meeting Was Cancelled</h1>
            <p className="text-muted-foreground">
              {booking.event_type?.title} was cancelled on{' '}
              {booking.cancelled_at ? format(new Date(booking.cancelled_at), 'PPP') : 'a previous date'}.
            </p>
          </div>
        )}

        {state === 'loaded' && booking && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {booking.event_type?.title || 'Meeting'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {booking.event_type?.duration_minutes} minutes
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {formatDateTime(booking.start_time, booking.guest_timezone)}
                  </p>
                  <p className="text-sm text-muted-foreground">{booking.guest_timezone}</p>
                </div>
              </div>

              {booking.meet_link && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <a
                      href={booking.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Join Google Meet
                    </a>
                  </div>
                </div>
              )}

              {booking.team_members.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Host{booking.team_members.length > 1 ? 's' : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.team_members.map(m => m.name).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Your Details</h2>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-foreground">{booking.guest_name}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-foreground">{booking.guest_email}</span>
              </div>

              {booking.guest_company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{booking.guest_company}</span>
                </div>
              )}

              {booking.guest_message && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-foreground">{booking.guest_message}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full min-h-[44px]" disabled={cancelling}>
                    {cancelling ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Cancelling...</>
                    ) : (
                      'Cancel Meeting'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this meeting?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your {booking.event_type?.title} and notify all attendees. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Cancel Meeting
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageBooking;
