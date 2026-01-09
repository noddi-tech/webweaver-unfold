import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format, isSameDay, startOfDay, addDays, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface InterviewSlot {
  id: string;
  interviewer_name: string;
  interview_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string | null;
  meeting_url: string | null;
  notes: string | null;
}

interface BookingInfo {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewType: string;
}

export default function CandidateBooking() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  // Verify token and get booking info
  const { data: bookingInfo, isLoading: isLoadingInfo, error: infoError } = useQuery({
    queryKey: ["booking-info", token],
    queryFn: async () => {
      if (!token) throw new Error("No booking token provided");
      
      // First, find any slot with this token to get the application ID
      const { data: slotWithToken, error: slotError } = await supabase
        .from("interview_slots")
        .select("booked_by_application_id, booking_token_expires_at")
        .eq("booking_token", token)
        .single();
      
      if (slotError) throw new Error("Invalid or expired booking link");
      
      // Check if token is expired
      if (slotWithToken.booking_token_expires_at && 
          new Date(slotWithToken.booking_token_expires_at) < new Date()) {
        throw new Error("This booking link has expired");
      }
      
      // Get application details
      const { data: application, error: appError } = await supabase
        .from("job_applications")
        .select(`
          id, applicant_name, applicant_email,
          job_listings (title)
        `)
        .eq("id", slotWithToken.booked_by_application_id)
        .single();
      
      if (appError) throw new Error("Application not found");
      
      return {
        applicationId: application.id,
        candidateName: application.applicant_name,
        candidateEmail: application.applicant_email,
        jobTitle: (application.job_listings as any)?.title || "Position",
        interviewType: "Interview"
      } as BookingInfo;
    },
    enabled: !!token,
    retry: false
  });

  // Fetch available slots
  const { data: availableSlots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ["available-slots", token],
    queryFn: async () => {
      if (!token) return [];
      
      const { data, error } = await supabase
        .from("interview_slots")
        .select("*")
        .eq("booking_token", token)
        .eq("is_available", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time");
      
      if (error) throw error;
      return data as InterviewSlot[];
    },
    enabled: !!token && !!bookingInfo
  });

  // Get unique dates that have available slots
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    availableSlots.forEach(slot => {
      dates.add(format(new Date(slot.start_time), "yyyy-MM-dd"));
    });
    return dates;
  }, [availableSlots]);

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots.filter(slot => 
      isSameDay(new Date(slot.start_time), selectedDate)
    );
  }, [availableSlots, selectedDate]);

  // Book slot mutation
  const bookSlot = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from("interview_slots")
        .update({ 
          is_available: false,
          booked_by_application_id: bookingInfo?.applicationId
        })
        .eq("id", slotId);
      
      if (error) throw error;
      
      // Create interview record
      const slot = availableSlots.find(s => s.id === slotId);
      if (slot) {
        const { error: interviewError } = await supabase
          .from("interviews")
          .insert({
            application_id: bookingInfo?.applicationId,
            title: `${slot.interview_type.replace("_", " ")} Interview`,
            interview_type: slot.interview_type,
            scheduled_at: slot.start_time,
            duration_minutes: slot.duration_minutes,
            location: slot.location,
            meeting_url: slot.meeting_url,
            interviewer_names: [slot.interviewer_name],
            status: "scheduled",
            candidate_notified: true
          });
        
        if (interviewError) console.error("Failed to create interview record:", interviewError);
      }
    },
    onSuccess: () => {
      setIsBooked(true);
      toast.success("Interview booked successfully!");
    },
    onError: (error) => {
      toast.error("Failed to book interview: " + error.message);
    }
  });

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    bookSlot.mutate(selectedSlot.id);
  };

  // Error state
  if (infoError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Invalid Booking Link</h2>
              <p className="text-muted-foreground">
                {(infoError as Error).message || "This booking link is invalid or has expired."}
              </p>
              <Button className="mt-6" onClick={() => navigate("/")}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (isBooked && selectedSlot) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Interview Scheduled!</h2>
              <p className="text-muted-foreground mb-6">
                Your interview has been successfully booked.
              </p>
              
              <div className="bg-muted rounded-lg p-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{format(new Date(selectedSlot.start_time), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedSlot.start_time), "h:mm a")} - {format(new Date(selectedSlot.end_time), "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>With {selectedSlot.interviewer_name}</span>
                </div>
                {selectedSlot.meeting_url && (
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={selectedSlot.meeting_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Join Meeting Link
                    </a>
                  </div>
                )}
                {selectedSlot.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedSlot.location}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                A confirmation email has been sent to {bookingInfo?.candidateEmail}
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (isLoadingInfo || isLoadingSlots) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading available times...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Schedule Your Interview</h1>
            <p className="text-muted-foreground">
              Hi {bookingInfo?.candidateName}! Please select a time for your interview
              for the <span className="font-medium">{bookingInfo?.jobTitle}</span> position.
            </p>
          </div>
          
          {availableSlots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No Available Slots</h3>
                <p className="text-muted-foreground">
                  There are currently no available interview slots. Please contact the recruiter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select a Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      return !availableDates.has(dateStr) || isBefore(date, startOfDay(new Date()));
                    }}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate 
                      ? `Available Times for ${format(selectedDate, "MMMM d")}`
                      : "Select a date to see times"}
                  </CardTitle>
                  {selectedDate && slotsForSelectedDate.length > 0 && (
                    <CardDescription>
                      {slotsForSelectedDate.length} slot{slotsForSelectedDate.length !== 1 ? "s" : ""} available
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Choose a date from the calendar</p>
                    </div>
                  ) : slotsForSelectedDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No available times for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slotsForSelectedDate.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "w-full p-4 rounded-lg border text-left transition-all",
                            selectedSlot?.id === slot.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary"
                              : "hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <span className="font-medium">
                                  {format(new Date(slot.start_time), "h:mm a")}
                                </span>
                                <span className="text-muted-foreground"> - </span>
                                <span className="font-medium">
                                  {format(new Date(slot.end_time), "h:mm a")}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {slot.duration_minutes} min
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            With {slot.interviewer_name}
                          </div>
                          {slot.meeting_url && (
                            <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Video call
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Confirm Button */}
          {selectedSlot && (
            <div className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {format(new Date(selectedSlot.start_time), "EEEE, MMMM d")} at {format(new Date(selectedSlot.start_time), "h:mm a")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot.duration_minutes} minute interview with {selectedSlot.interviewer_name}
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={handleConfirmBooking}
                      disabled={bookSlot.isPending}
                    >
                      {bookSlot.isPending ? "Booking..." : "Confirm Interview"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
