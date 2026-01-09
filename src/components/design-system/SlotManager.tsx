import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, addDays, setHours, setMinutes, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { Plus, Calendar as CalendarIcon, Clock, Trash2, User, Video, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewSlot {
  id: string;
  job_id: string | null;
  interviewer_name: string;
  interviewer_email: string | null;
  interview_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  booked_by_application_id: string | null;
  booking_token: string | null;
  location: string | null;
  meeting_url: string | null;
  notes: string | null;
}

const INTERVIEW_TYPES = [
  { value: "phone_screen", label: "Phone Screen" },
  { value: "technical", label: "Technical Interview" },
  { value: "behavioral", label: "Behavioral Interview" },
  { value: "culture_fit", label: "Culture Fit" },
  { value: "final_round", label: "Final Round" },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

const DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
];

export function SlotManager() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Form state for bulk add
  const [bulkForm, setBulkForm] = useState({
    interviewerName: "",
    interviewerEmail: "",
    interviewType: "phone_screen",
    duration: 30,
    meetingUrl: "",
    selectedDays: [1, 2, 3, 4, 5] as number[], // Mon-Fri
    selectedTimes: ["09:00", "10:00", "14:00", "15:00"],
    dateRange: {
      from: new Date(),
      to: addWeeks(new Date(), 2)
    }
  });

  // Fetch slots
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["interview-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_slots")
        .select("*")
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      return data as InterviewSlot[];
    }
  });

  // Fetch jobs for filtering
  const { data: jobs = [] } = useQuery({
    queryKey: ["job-listings-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_listings")
        .select("id, title")
        .eq("active", true)
        .order("title");
      
      if (error) throw error;
      return data;
    }
  });

  // Create slots mutation
  const createSlots = useMutation({
    mutationFn: async (slotsToCreate: Record<string, unknown>[]) => {
      const { error } = await supabase
        .from("interview_slots")
        .insert(slotsToCreate as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-slots"] });
      toast.success("Interview slots created successfully");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create slots: " + error.message);
    }
  });

  // Delete slot mutation
  const deleteSlot = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from("interview_slots")
        .delete()
        .eq("id", slotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-slots"] });
      toast.success("Slot deleted");
    }
  });

  // Generate bulk slots
  const handleBulkCreate = () => {
    const slotsToCreate: Record<string, unknown>[] = [];
    let currentDate = new Date(bulkForm.dateRange.from);
    
    while (currentDate <= bulkForm.dateRange.to) {
      const dayOfWeek = currentDate.getDay();
      
      if (bulkForm.selectedDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) {
        for (const time of bulkForm.selectedTimes) {
          const [hours, minutes] = time.split(":").map(Number);
          const startTime = setMinutes(setHours(new Date(currentDate), hours), minutes);
          const endTime = new Date(startTime.getTime() + bulkForm.duration * 60000);
          
          slotsToCreate.push({
            interviewer_name: bulkForm.interviewerName,
            interviewer_email: bulkForm.interviewerEmail || null,
            interview_type: bulkForm.interviewType,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration_minutes: bulkForm.duration,
            meeting_url: bulkForm.meetingUrl || null,
            is_available: true
          });
        }
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    if (slotsToCreate.length === 0) {
      toast.error("No slots to create. Check your day/time selections.");
      return;
    }
    
    createSlots.mutate(slotsToCreate);
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = format(new Date(slot.start_time), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, InterviewSlot[]>);

  // Get week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Slots</h2>
          <p className="text-muted-foreground">Manage available time slots for candidate self-booking</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Slots
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Interview Slots</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Interviewer Name *</Label>
                  <Input
                    value={bulkForm.interviewerName}
                    onChange={(e) => setBulkForm(f => ({ ...f, interviewerName: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interviewer Email</Label>
                  <Input
                    type="email"
                    value={bulkForm.interviewerEmail}
                    onChange={(e) => setBulkForm(f => ({ ...f, interviewerEmail: e.target.value }))}
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Interview Type</Label>
                  <Select
                    value={bulkForm.interviewType}
                    onValueChange={(v) => setBulkForm(f => ({ ...f, interviewType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={bulkForm.duration.toString()}
                    onValueChange={(v) => setBulkForm(f => ({ ...f, duration: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map(d => (
                        <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Meeting URL (optional)</Label>
                <Input
                  value={bulkForm.meetingUrl}
                  onChange={(e) => setBulkForm(f => ({ ...f, meetingUrl: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(bulkForm.dateRange.from, "MMM d")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bulkForm.dateRange.from}
                        onSelect={(d) => d && setBulkForm(f => ({ ...f, dateRange: { ...f.dateRange, from: d } }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(bulkForm.dateRange.to, "MMM d")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bulkForm.dateRange.to}
                        onSelect={(d) => d && setBulkForm(f => ({ ...f, dateRange: { ...f.dateRange, to: d } }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const dayNum = i + 1;
                    const isSelected = bulkForm.selectedDays.includes(dayNum === 7 ? 0 : dayNum);
                    return (
                      <Button
                        key={day}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const actualDay = dayNum === 7 ? 0 : dayNum;
                          setBulkForm(f => ({
                            ...f,
                            selectedDays: isSelected
                              ? f.selectedDays.filter(d => d !== actualDay)
                              : [...f.selectedDays, actualDay]
                          }));
                        }}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Time Slots</Label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(time => {
                    const isSelected = bulkForm.selectedTimes.includes(time);
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setBulkForm(f => ({
                            ...f,
                            selectedTimes: isSelected
                              ? f.selectedTimes.filter(t => t !== time)
                              : [...f.selectedTimes, time].sort()
                          }));
                        }}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkCreate}
                  disabled={!bulkForm.interviewerName || bulkForm.selectedTimes.length === 0}
                >
                  Create Slots
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setWeekStart(addWeeks(weekStart, -1))}
        >
          ← Previous Week
        </Button>
        <span className="font-medium">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button
          variant="outline"
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
        >
          Next Week →
        </Button>
      </div>
      
      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateKey = format(day, "yyyy-MM-dd");
          const daySlots = slotsByDate[dateKey] || [];
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={dateKey} className={cn("min-h-[200px]", isToday && "ring-2 ring-primary")}>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">
                  <span className="block text-xs text-muted-foreground">{format(day, "EEE")}</span>
                  {format(day, "d")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No slots</p>
                ) : (
                  daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className={cn(
                        "p-2 rounded text-xs border",
                        slot.is_available 
                          ? "bg-primary/10 border-primary/20" 
                          : "bg-muted border-muted-foreground/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {format(new Date(slot.start_time), "HH:mm")}
                        </span>
                        {slot.is_available ? (
                          <Badge variant="outline" className="text-[10px] px-1">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1">
                            Booked
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {slot.interviewer_name}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground capitalize">
                          {slot.interview_type.replace("_", " ")}
                        </span>
                        {slot.is_available && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => deleteSlot.mutate(slot.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {slots.filter(s => s.is_available).length}
            </div>
            <p className="text-sm text-muted-foreground">Available Slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {slots.filter(s => !s.is_available).length}
            </div>
            <p className="text-sm text-muted-foreground">Booked Slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {slots.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Slots</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
