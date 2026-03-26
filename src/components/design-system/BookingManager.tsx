import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Clock, Calendar, Users, X, Loader2, AlertTriangle, Unplug } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  title: string | null;
  slug: string | null;
  active: boolean;
  google_calendar_connected: boolean;
  timezone: string;
}

interface AvailabilityRule {
  id: string;
  team_member_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  min_duration_minutes: number | null;
  max_duration_minutes: number | null;
  duration_step_minutes: number | null;
  buffer_minutes: number | null;
  requires_all_members: boolean | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface EventTypeMember {
  id: string;
  event_type_id: string;
  team_member_id: string;
  is_required: boolean | null;
}

interface EventTypeAvailability {
  id: string;
  event_type_id: string;
  type: 'recurring' | 'date_range';
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  date_start: string | null;
  date_end: string | null;
}

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_company: string | null;
  guest_message: string | null;
  guest_timezone: string;
  start_time: string;
  end_time: string;
  status: string | null;
  cancelled_at: string | null;
  event_type_id: string | null;
  created_at: string | null;
}

// Time slot options (15-min increments)
const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 20; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 20 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]; // Mon=0 .. Sun=6

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// ──────────────────── TEAM MEMBERS TAB ────────────────────
function TeamMembersTab() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  // Availability sheet
  const [availMember, setAvailMember] = useState<TeamMember | null>(null);
  const [availRules, setAvailRules] = useState<{ day: number; enabled: boolean; start: string; end: string }[]>([]);
  const [savingAvail, setSavingAvail] = useState(false);

  const fetchMembers = async () => {
    const { data } = await supabase.from("employees").select("id, name, email, title, slug, active, google_calendar_connected, timezone").not("email", "is", null).order("name");
    if (data) setMembers(data as TeamMember[]);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  // Detect OAuth redirect success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      toast({ title: "Google Calendar connected successfully!" });
      window.history.replaceState({}, "", window.location.pathname);
      fetchMembers();
    }
  }, []);

  const handleDisconnect = async () => {
    if (!disconnectingId) return;
    setDisconnectLoading(true);
    const { error } = await supabase.from("employees").update({ google_calendar_connected: false }).eq("id", disconnectingId);
    if (error) {
      toast({ variant: "destructive", title: "Error disconnecting", description: error.message });
    } else {
      toast({ title: "Google Calendar disconnected" });
      fetchMembers();
    }
    setDisconnectLoading(false);
    setDisconnectingId(null);
  };

  const hasUnconnectedMembers = members.some(m => m.active && !m.google_calendar_connected);

  // Availability
  const openAvailability = async (m: TeamMember) => {
    setAvailMember(m);
    const { data } = await supabase.from("availability_rules").select("*").eq("team_member_id", m.id);
    const rules = [1, 2, 3, 4, 5].map(day => {
      const existing = (data || []).find((r: AvailabilityRule) => r.day_of_week === day);
      return { day, enabled: !!existing, start: existing?.start_time || "09:00", end: existing?.end_time || "16:00" };
    });
    setAvailRules(rules);
  };

  const saveAvailability = async () => {
    if (!availMember) return;
    setSavingAvail(true);
    await supabase.from("availability_rules").delete().eq("team_member_id", availMember.id);
    const toInsert = availRules.filter(r => r.enabled).map(r => ({
      team_member_id: availMember.id,
      day_of_week: r.day,
      start_time: r.start,
      end_time: r.end,
    }));
    if (toInsert.length > 0) {
      const { error } = await supabase.from("availability_rules").insert(toInsert);
      if (error) { toast({ variant: "destructive", title: "Error saving availability", description: error.message }); }
      else { toast({ title: "Availability saved" }); }
    } else {
      toast({ title: "Availability saved (no active days)" });
    }
    setSavingAvail(false);
    setAvailMember(null);
  };

  return (
    <div className="space-y-4">
      {!loading && hasUnconnectedMembers && (
        <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Calendar not connected</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Some team members haven't connected their Google Calendar yet. Availability may be inaccurate.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <p className="text-sm text-muted-foreground">Manage members in the Employees tab</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Google Calendar</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
          ) : members.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No team members with email addresses</TableCell></TableRow>
          ) : members.map(m => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>{m.title || "—"}</TableCell>
              <TableCell>
                {m.google_calendar_connected
                  ? <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                      <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => setDisconnectingId(m.id)}>
                        <Unplug className="w-3.5 h-3.5 mr-1" /> Disconnect
                      </Button>
                    </div>
                  : <Button variant="outline" size="sm" onClick={async () => {
                      try {
                        const res = await supabase.functions.invoke('google-auth-url', {
                          body: { team_member_id: m.id },
                        });
                        if (res.error) throw res.error;
                        const { url } = res.data;
                        if (url) window.open(url, '_blank');
                      } catch (err) {
                        console.error('Failed to get Google auth URL:', err);
                      }
                    }}><Calendar className="w-4 h-4 mr-1" /> Connect</Button>
                }
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => openAvailability(m)}><Clock className="w-4 h-4 mr-1" /> Availability</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Availability Sheet */}
      <Sheet open={!!availMember} onOpenChange={open => { if (!open) setAvailMember(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Availability — {availMember?.name}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            {availRules.map((rule, idx) => (
              <div key={rule.day} className="flex items-center gap-3 border-b border-border pb-3">
                <Switch checked={rule.enabled} onCheckedChange={checked => {
                  const updated = [...availRules];
                  updated[idx] = { ...rule, enabled: !!checked };
                  setAvailRules(updated);
                }} />
                <span className="w-24 text-sm font-medium">{DAY_NAMES[rule.day]}</span>
                {rule.enabled && (
                  <>
                    <Select value={rule.start} onValueChange={v => { const u = [...availRules]; u[idx] = { ...rule, start: v }; setAvailRules(u); }}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-muted-foreground">–</span>
                    <Select value={rule.end} onValueChange={v => { const u = [...availRules]; u[idx] = { ...rule, end: v }; setAvailRules(u); }}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </>
                )}
              </div>
            ))}
            <Button onClick={saveAvailability} disabled={savingAvail} className="w-full">
              {savingAvail && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Save Availability
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Disconnect confirmation */}
      <AlertDialog open={!!disconnectingId} onOpenChange={open => { if (!open) setDisconnectingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect Google Calendar for this team member. Their availability will no longer sync with Google Calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} disabled={disconnectLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {disconnectLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ──────────────────── EVENT TYPES TAB ────────────────────
function EventTypesTab() {
  const { toast } = useToast();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<EventTypeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", duration: "30", buffer: "15", requires_all: false, color: "#3b82f6", min_duration: "", max_duration: "", duration_step: "15" });
  const [selectedMembers, setSelectedMembers] = useState<{ memberId: string; required: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  // Event-type availability state
  const [limitAvailability, setLimitAvailability] = useState(false);
  const [recurringDays, setRecurringDays] = useState<{ day: number; enabled: boolean; start: string; end: string }[]>(
    ALL_DAYS.map(d => ({ day: d, enabled: false, start: "09:00", end: "17:00" }))
  );
  const [dateRanges, setDateRanges] = useState<{ date_start: string; date_end: string; start_time: string; end_time: string }[]>([]);

  const fetchData = async () => {
    const [etRes, mRes, aRes] = await Promise.all([
      supabase.from("event_types").select("*").order("title"),
      supabase.from("employees").select("id, name, email, title, slug, active, google_calendar_connected, timezone").eq("active", true).not("email", "is", null).order("name"),
      supabase.from("event_type_members").select("*"),
    ]);
    if (etRes.data) setEventTypes(etRes.data as EventType[]);
    if (mRes.data) setMembers(mRes.data as TeamMember[]);
    if (aRes.data) setAssignments(aRes.data as EventTypeMember[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", slug: "", description: "", duration: "30", buffer: "15", requires_all: false, color: "#3b82f6", min_duration: "", max_duration: "", duration_step: "15" });
    setSelectedMembers([]);
    setLimitAvailability(false);
    setRecurringDays(ALL_DAYS.map(d => ({ day: d, enabled: false, start: "09:00", end: "17:00" })));
    setDateRanges([]);
    setDialogOpen(true);
  };

  const openEdit = async (et: EventType) => {
    setEditing(et);
    setForm({
      title: et.title,
      slug: et.slug,
      description: et.description || "",
      duration: String(et.duration_minutes || 30),
      buffer: String(et.buffer_minutes || 0),
      requires_all: et.requires_all_members || false,
      color: et.color || "#3b82f6",
      min_duration: et.min_duration_minutes ? String(et.min_duration_minutes) : "",
      max_duration: et.max_duration_minutes ? String(et.max_duration_minutes) : "",
      duration_step: String(et.duration_step_minutes || 15),
    });
    const assigned = assignments.filter(a => a.event_type_id === et.id);
    setSelectedMembers(assigned.map(a => ({ memberId: a.team_member_id, required: a.is_required || false })));

    // Load event-type availability
    const { data: avail } = await supabase.from("event_type_availability").select("*").eq("event_type_id", et.id);
    const rows = (avail || []) as EventTypeAvailability[];
    if (rows.length > 0) {
      setLimitAvailability(true);
      const days = ALL_DAYS.map(d => {
        const r = rows.find(row => row.type === 'recurring' && row.day_of_week === d);
        return { day: d, enabled: !!r, start: r?.start_time || "09:00", end: r?.end_time || "17:00" };
      });
      setRecurringDays(days);
      setDateRanges(rows.filter(r => r.type === 'date_range').map(r => ({ date_start: r.date_start || '', date_end: r.date_end || '', start_time: r.start_time || '09:00', end_time: r.end_time || '17:00' })));
    } else {
      setLimitAvailability(false);
      setRecurringDays(ALL_DAYS.map(d => ({ day: d, enabled: false, start: "09:00", end: "17:00" })));
      setDateRanges([]);
    }

    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      description: form.description || null,
      duration_minutes: parseInt(form.duration),
      buffer_minutes: parseInt(form.buffer),
      requires_all_members: form.requires_all,
      color: form.color,
      min_duration_minutes: form.min_duration ? parseInt(form.min_duration) : null,
      max_duration_minutes: form.max_duration ? parseInt(form.max_duration) : null,
      duration_step_minutes: parseInt(form.duration_step) || 15,
    };

    let eventId: string;
    if (editing) {
      const { error } = await supabase.from("event_types").update(payload).eq("id", editing.id);
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); setSaving(false); return; }
      eventId = editing.id;
    } else {
      const { data, error } = await supabase.from("event_types").insert(payload).select("id").single();
      if (error || !data) { toast({ variant: "destructive", title: "Error", description: error?.message }); setSaving(false); return; }
      eventId = data.id;
    }

    // Sync members
    await supabase.from("event_type_members").delete().eq("event_type_id", eventId);
    if (selectedMembers.length > 0) {
      await supabase.from("event_type_members").insert(
        selectedMembers.map(sm => ({ event_type_id: eventId, team_member_id: sm.memberId, is_required: sm.required }))
      );
    }

    // Sync event-type availability
    await supabase.from("event_type_availability").delete().eq("event_type_id", eventId);
    if (limitAvailability) {
      const availRows: any[] = [];
      for (const rd of recurringDays) {
        if (rd.enabled) {
          availRows.push({ event_type_id: eventId, type: 'recurring', day_of_week: rd.day, start_time: rd.start, end_time: rd.end });
        }
      }
      for (const dr of dateRanges) {
        if (dr.date_start && dr.date_end) {
          availRows.push({ event_type_id: eventId, type: 'date_range', date_start: dr.date_start, date_end: dr.date_end, start_time: dr.start_time, end_time: dr.end_time });
        }
      }
      if (availRows.length > 0) {
        await supabase.from("event_type_availability").insert(availRows);
      }
    }

    toast({ title: editing ? "Event type updated" : "Event type created" });
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const toggleActive = async (et: EventType) => {
    await supabase.from("event_types").update({ is_active: !et.is_active }).eq("id", et.id);
    fetchData();
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => {
      const existing = prev.find(s => s.memberId === memberId);
      if (existing) return prev.filter(s => s.memberId !== memberId);
      return [...prev, { memberId, required: false }];
    });
  };

  const toggleRequired = (memberId: string) => {
    setSelectedMembers(prev => prev.map(s => s.memberId === memberId ? { ...s, required: !s.required } : s));
  };

  const getMemberNames = (etId: string) => {
    const ids = assignments.filter(a => a.event_type_id === etId).map(a => a.team_member_id);
    return members.filter(m => ids.includes(m.id)).map(m => m.name).join(", ") || "—";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Types</h3>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Event Type</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Buffer</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
          ) : eventTypes.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No event types yet</TableCell></TableRow>
          ) : eventTypes.map(et => (
            <TableRow key={et.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {et.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: et.color }} />}
                  {et.title}
                </div>
              </TableCell>
              <TableCell><Badge variant="secondary">{et.min_duration_minutes && et.max_duration_minutes ? `${et.min_duration_minutes}–${et.max_duration_minutes}` : et.duration_minutes} min</Badge></TableCell>
              <TableCell>{et.buffer_minutes || 0} min</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{getMemberNames(et.id)}</TableCell>
              <TableCell><Switch checked={et.is_active ?? true} onCheckedChange={() => toggleActive(et)} /></TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => openEdit(et)}><Pencil className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Event Type</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editing ? f.slug : generateSlug(e.target.value) }))} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Duration</Label>
                <Select value={form.duration} onValueChange={v => setForm(f => ({ ...f, duration: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map(d => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Buffer</Label>
                <Select value={form.buffer} onValueChange={v => setForm(f => ({ ...f, buffer: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 10, 15].map(b => <SelectItem key={b} value={String(b)}>{b} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Min Duration</Label>
                <Select value={form.min_duration || "none"} onValueChange={v => setForm(f => ({ ...f, min_duration: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Fixed" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Fixed (no range)</SelectItem>
                    {[15, 30, 45, 60].map(d => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Duration</Label>
                <Select value={form.max_duration || "none"} onValueChange={v => setForm(f => ({ ...f, max_duration: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Fixed" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Fixed (no range)</SelectItem>
                    {[30, 45, 60, 90, 120].map(d => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Step</Label>
                <Select value={form.duration_step} onValueChange={v => setForm(f => ({ ...f, duration_step: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 30].map(s => <SelectItem key={s} value={String(s)}>{s} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.requires_all} onCheckedChange={c => setForm(f => ({ ...f, requires_all: !!c }))} />
              <Label>Requires all members</Label>
            </div>
            <div><Label>Color</Label><Input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-20 h-10" /></div>

            <div>
              <Label className="mb-2 block">Assigned Members</Label>
              <div className="space-y-2 border border-border rounded-md p-3">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active team members</p>
                ) : members.map(m => {
                  const selected = selectedMembers.find(s => s.memberId === m.id);
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <Checkbox checked={!!selected} onCheckedChange={() => toggleMember(m.id)} />
                      <span className="text-sm flex-1">{m.name}</span>
                      {selected && (
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Checkbox checked={selected.required} onCheckedChange={() => toggleRequired(m.id)} />
                          Required
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event-type availability */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Switch checked={limitAvailability} onCheckedChange={c => setLimitAvailability(!!c)} />
                <Label>Limit availability for this event type</Label>
              </div>
              {limitAvailability && (
                <div className="space-y-4">
                  {/* Recurring days */}
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Recurring weekly days</Label>
                    <div className="space-y-2">
                      {recurringDays.map((rd, idx) => (
                        <div key={rd.day} className="flex items-center gap-3">
                          <Checkbox checked={rd.enabled} onCheckedChange={checked => {
                            const u = [...recurringDays]; u[idx] = { ...rd, enabled: !!checked }; setRecurringDays(u);
                          }} />
                          <span className="w-12 text-sm font-medium">{DAY_NAMES_SHORT[rd.day]}</span>
                          {rd.enabled && (
                            <>
                              <Select value={rd.start} onValueChange={v => { const u = [...recurringDays]; u[idx] = { ...rd, start: v }; setRecurringDays(u); }}>
                                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                              </Select>
                              <span className="text-muted-foreground">–</span>
                              <Select value={rd.end} onValueChange={v => { const u = [...recurringDays]; u[idx] = { ...rd, end: v }; setRecurringDays(u); }}>
                                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                              </Select>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date ranges */}
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Specific date ranges</Label>
                    <div className="space-y-2">
                      {dateRanges.map((dr, idx) => (
                        <div key={idx} className="flex items-center gap-2 flex-wrap">
                          <Input type="date" value={dr.date_start} onChange={e => {
                            const u = [...dateRanges]; u[idx] = { ...dr, date_start: e.target.value }; setDateRanges(u);
                          }} className="w-36" />
                          <span className="text-muted-foreground">to</span>
                          <Input type="date" value={dr.date_end} onChange={e => {
                            const u = [...dateRanges]; u[idx] = { ...dr, date_end: e.target.value }; setDateRanges(u);
                          }} className="w-36" />
                          <span className="text-muted-foreground">|</span>
                          <Select value={dr.start_time} onValueChange={v => { const u = [...dateRanges]; u[idx] = { ...dr, start_time: v }; setDateRanges(u); }}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                          <span className="text-muted-foreground">–</span>
                          <Select value={dr.end_time} onValueChange={v => { const u = [...dateRanges]; u[idx] = { ...dr, end_time: v }; setDateRanges(u); }}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => setDateRanges(dateRanges.filter((_, i) => i !== idx))}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setDateRanges([...dateRanges, { date_start: '', date_end: '', start_time: '09:00', end_time: '17:00' }])}>
                        <Plus className="w-4 h-4 mr-1" /> Add date range
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving || !form.title}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}{editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────── BOOKINGS TAB ────────────────────
function BookingsTab() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [bookingMembers, setBookingMembers] = useState<{ booking_id: string; team_member_id: string }[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEventType, setFilterEventType] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const fetchData = async () => {
    const [bRes, etRes, bmRes, mRes] = await Promise.all([
      supabase.from("bookings").select("*").order("start_time", { ascending: false }),
      supabase.from("event_types").select("*"),
      supabase.from("booking_members").select("booking_id, team_member_id"),
      supabase.from("employees").select("id, name, email, title, slug, active, google_calendar_connected, timezone"),
    ]);
    if (bRes.data) setBookings(bRes.data as Booking[]);
    if (etRes.data) setEventTypes(etRes.data as EventType[]);
    if (bmRes.data) setBookingMembers(bmRes.data);
    if (mRes.data) setMembers(mRes.data as TeamMember[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (filterEventType !== "all" && b.event_type_id !== filterEventType) return false;
      return true;
    });
  }, [bookings, filterStatus, filterEventType]);

  const getEventTitle = (id: string | null) => eventTypes.find(e => e.id === id)?.title || "—";
  const getMemberNames = (bookingId: string) => {
    const ids = bookingMembers.filter(bm => bm.booking_id === bookingId).map(bm => bm.team_member_id);
    return members.filter(m => ids.includes(m.id)).map(m => m.name).join(", ") || "—";
  };

  const cancelBooking = async () => {
    if (!cancelTarget) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", cancelTarget.id);
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
    else { toast({ title: "Booking cancelled" }); }
    setCancelTarget(null);
    fetchData();
  };

  const statusColor = (s: string | null) => {
    switch (s) {
      case "confirmed": return "default";
      case "cancelled": return "destructive";
      case "completed": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold">Bookings</h3>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterEventType} onValueChange={setFilterEventType}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Event type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {eventTypes.map(et => <SelectItem key={et.id} value={et.id}>{et.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">💡 Past confirmed bookings should be manually marked as completed or automated via a cron job.</p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings found</TableCell></TableRow>
          ) : filtered.map(b => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">{b.guest_name}</TableCell>
              <TableCell>{b.guest_email}</TableCell>
              <TableCell>{getEventTitle(b.event_type_id)}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {format(new Date(b.start_time), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{getMemberNames(b.id)}</TableCell>
              <TableCell><Badge variant={statusColor(b.status)}>{b.status || "confirmed"}</Badge></TableCell>
              <TableCell>
                {b.status !== "cancelled" && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCancelTarget(b)}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!cancelTarget} onOpenChange={open => { if (!open) setCancelTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the booking with {cancelTarget?.guest_name} ({cancelTarget?.guest_email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction onClick={cancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel booking</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ──────────────────── MAIN COMPONENT ────────────────────
export default function BookingManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <p className="text-muted-foreground">Manage team members, event types, and meeting bookings.</p>
      </div>
      <Tabs defaultValue="team-members" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="team-members" className="flex items-center gap-1"><Users className="w-4 h-4" /> Team Members</TabsTrigger>
          <TabsTrigger value="event-types" className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Event Types</TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-1"><Clock className="w-4 h-4" /> Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="team-members"><TeamMembersTab /></TabsContent>
        <TabsContent value="event-types"><EventTypesTab /></TabsContent>
        <TabsContent value="bookings"><BookingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
