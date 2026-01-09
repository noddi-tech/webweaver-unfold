import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Calendar, Video, Phone, Building } from "lucide-react";
import { format } from "date-fns";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string | null;
}

const INTERVIEW_TYPES = [
  { value: "phone_screen", label: "Phone Screen", icon: <Phone className="w-4 h-4" /> },
  { value: "technical", label: "Technical Interview", icon: <Video className="w-4 h-4" /> },
  { value: "behavioral", label: "Behavioral Interview", icon: <Video className="w-4 h-4" /> },
  { value: "final", label: "Final Round", icon: <Building className="w-4 h-4" /> },
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export default function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicationId: preselectedAppId,
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [applicationId, setApplicationId] = useState(preselectedAppId || "");
  const [interviewType, setInterviewType] = useState("technical");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [locationType, setLocationType] = useState<"video" | "phone" | "in_person">("video");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [location, setLocation] = useState("");
  const [interviewerNames, setInterviewerNames] = useState("");
  const [notes, setNotes] = useState("");
  const [sendInvite, setSendInvite] = useState(true);

  // Fetch applications for dropdown
  const { data: applications = [] } = useQuery({
    queryKey: ["applications-for-interview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          applicant_name,
          applicant_email,
          job_listings (
            title
          )
        `)
        .in("status", ["submitted", "under_review", "interview_scheduled"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Set preselected application
  useEffect(() => {
    if (preselectedAppId) {
      setApplicationId(preselectedAppId);
    }
  }, [preselectedAppId]);

  // Auto-generate title when application or type changes
  useEffect(() => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      const typeLabel = INTERVIEW_TYPES.find(t => t.value === interviewType)?.label || "Interview";
      setTitle(`${typeLabel} - ${app.applicant_name}`);
    }
  }, [applicationId, interviewType, applications]);

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!applicationId || !date || !time) {
        throw new Error("Please fill in all required fields");
      }

      const scheduledAt = new Date(`${date}T${time}`);
      const app = applications.find(a => a.id === applicationId);

      // Create interview
      const { data: interview, error } = await supabase
        .from("interviews")
        .insert({
          application_id: applicationId,
          interview_type: interviewType,
          title,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: duration,
          location: locationType === "in_person" ? location : locationType === "phone" ? "Phone Call" : "Video Call",
          meeting_url: locationType === "video" ? meetingUrl : null,
          interviewer_names: interviewerNames ? interviewerNames.split(",").map(n => n.trim()) : null,
          notes: notes || null,
          candidate_notified: sendInvite,
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email if requested
      if (sendInvite && app) {
        try {
          await supabase.functions.invoke("send-interview-invitation", {
            body: {
              applicationId,
              applicantName: app.applicant_name,
              applicantEmail: app.applicant_email,
              jobTitle: app.job_listings?.title || "Position",
              interviewType: INTERVIEW_TYPES.find(t => t.value === interviewType)?.label || interviewType,
              interviewDate: format(scheduledAt, "EEEE, MMMM d, yyyy"),
              interviewTime: format(scheduledAt, "h:mm a"),
              interviewDuration: duration,
              interviewLocation: locationType === "video" ? meetingUrl : locationType === "phone" ? "Phone Call" : location,
              meetingUrl: locationType === "video" ? meetingUrl : null,
              notes,
            },
          });
        } catch (emailError) {
          console.error("Failed to send interview invitation:", emailError);
          // Don't fail the whole operation if email fails
        }
      }

      // Update application status
      await supabase
        .from("job_applications")
        .update({ 
          status: "interview_scheduled",
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      return interview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-job-applications"] });
      toast({ title: "Interview scheduled successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to schedule", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setApplicationId(preselectedAppId || "");
    setInterviewType("technical");
    setTitle("");
    setDate("");
    setTime("10:00");
    setDuration(60);
    setLocationType("video");
    setMeetingUrl("");
    setLocation("");
    setInterviewerNames("");
    setNotes("");
    setSendInvite(true);
  };

  const selectedApp = applications.find(a => a.id === applicationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Candidate Selection */}
          <div>
            <Label>Candidate *</Label>
            <Select value={applicationId} onValueChange={setApplicationId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a candidate" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.applicant_name} - {app.job_listings?.title || "Unknown position"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interview Type */}
          <div>
            <Label>Interview Type</Label>
            <RadioGroup
              value={interviewType}
              onValueChange={setInterviewType}
              className="grid grid-cols-2 gap-2 mt-1"
            >
              {INTERVIEW_TYPES.map((type) => (
                <div key={type.value}>
                  <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                  <Label
                    htmlFor={type.value}
                    className="flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                      hover:bg-muted/50"
                  >
                    {type.icon}
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Title */}
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Interview title"
              className="mt-1"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label>Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Type */}
          <div>
            <Label>Location</Label>
            <RadioGroup
              value={locationType}
              onValueChange={(v) => setLocationType(v as any)}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="video" id="loc-video" />
                <Label htmlFor="loc-video" className="flex items-center gap-1 cursor-pointer">
                  <Video className="w-4 h-4" /> Video Call
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="phone" id="loc-phone" />
                <Label htmlFor="loc-phone" className="flex items-center gap-1 cursor-pointer">
                  <Phone className="w-4 h-4" /> Phone
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="in_person" id="loc-office" />
                <Label htmlFor="loc-office" className="flex items-center gap-1 cursor-pointer">
                  <Building className="w-4 h-4" /> In-Person
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Meeting URL or Location */}
          {locationType === "video" && (
            <div>
              <Label>Meeting URL</Label>
              <Input
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="mt-1"
              />
            </div>
          )}
          {locationType === "in_person" && (
            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Office - Conference Room A"
                className="mt-1"
              />
            </div>
          )}

          {/* Interviewers */}
          <div>
            <Label>Interviewers</Label>
            <Input
              value={interviewerNames}
              onChange={(e) => setInterviewerNames(e.target.value)}
              placeholder="Alice, Bob, Carol (comma-separated)"
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes for Candidate</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any instructions or information for the candidate..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Send Invite Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="send-invite"
              checked={sendInvite}
              onCheckedChange={(v) => setSendInvite(!!v)}
            />
            <Label htmlFor="send-invite" className="cursor-pointer">
              Send interview invitation email to candidate
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => scheduleMutation.mutate()} 
            disabled={scheduleMutation.isPending || !applicationId || !date || !time}
          >
            {scheduleMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            Schedule Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
