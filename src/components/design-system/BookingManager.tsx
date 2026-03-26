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
  email: string;
  title: string | null;
  slug: string;
  is_active: boolean;
  google_calendar_connected: boolean;
  created_at: string;
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

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// ──────────────────── TEAM MEMBERS TAB ────────────────────
function TeamMembersTab() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: "", email: "", title: "", slug: "" });
  const [saving, setSaving] = useState(false);

  // Availability sheet
  const [availMember, setAvailMember] = useState<TeamMember | null>(null);
  const [availRules, setAvailRules] = useState<{ day: number; enabled: boolean; start: string; end: string }[]>([]);
  const [savingAvail, setSavingAvail] = useState(false);

  const fetchMembers = async () => {
    const { data } = await supabase.from("team_members").select("*").order("name");
    if (data) setMembers(data as TeamMember[]);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", title: "", slug: "" });
    setDialogOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ name: m.name, email: m.email, title: m.title || "", slug: m.slug });
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: editing ? f.slug : generateSlug(name) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    const payload = { name: form.name, email: form.email, title: form.title || null, slug: form.slug || generateSlug(form.name) };
    if (editing) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", editing.id);
      if (error) { toast({ variant: "destructive", title: "Error updating member", description: error.message }); }
      else { toast({ title: "Member updated" }); }
    } else {
      const { error } = await supabase.from("team_members").insert(payload);
      if (error) { toast({ variant: "destructive", title: "Error adding member", description: error.message }); }
      else { toast({ title: "Member added" }); }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchMembers();
  };

  const toggleActive = async (m: TeamMember) => {
    await supabase.from("team_members").update({ is_active: !m.is_active }).eq("id", m.id);
    fetchMembers();
  };

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
    // Delete existing rules
    await supabase.from("availability_rules").delete().eq("team_member_id", availMember.id);
    // Insert enabled ones
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Team Member</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Google Calendar</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
          ) : members.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No team members yet</TableCell></TableRow>
          ) : members.map(m => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>{m.title || "—"}</TableCell>
              <TableCell>
                {m.google_calendar_connected
                  ? <Badge variant="default" className="bg-green-600">Connected</Badge>
                  : <Button variant="outline" size="sm" onClick={() => {
                      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
                      const redirectUri = `https://${projectId}.supabase.co/functions/v1/google-auth-callback`;
                      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy')}&access_type=offline&prompt=consent&state=${m.id}`;
                      window.open(oauthUrl, '_blank');
                    }}>Connect</Button>
                }
              </TableCell>
              <TableCell>
                <Switch checked={m.is_active} onCheckedChange={() => toggleActive(m)} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openAvailability(m)}><Clock className="w-4 h-4 mr-1" /> Availability</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => handleNameChange(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Co-founder" /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.email}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}{editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
  const [form, setForm] = useState({ title: "", slug: "", description: "", duration: "30", buffer: "15", requires_all: false, color: "#3b82f6" });
  const [selectedMembers, setSelectedMembers] = useState<{ memberId: string; required: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [etRes, mRes, aRes] = await Promise.all([
      supabase.from("event_types").select("*").order("title"),
      supabase.from("team_members").select("*").eq("is_active", true).order("name"),
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
    setForm({ title: "", slug: "", description: "", duration: "30", buffer: "15", requires_all: false, color: "#3b82f6" });
    setSelectedMembers([]);
    setDialogOpen(true);
  };

  const openEdit = (et: EventType) => {
    setEditing(et);
    setForm({
      title: et.title,
      slug: et.slug,
      description: et.description || "",
      duration: String(et.duration_minutes || 30),
      buffer: String(et.buffer_minutes || 0),
      requires_all: et.requires_all_members || false,
      color: et.color || "#3b82f6",
    });
    const assigned = assignments.filter(a => a.event_type_id === et.id);
    setSelectedMembers(assigned.map(a => ({ memberId: a.team_member_id, required: a.is_required || false })));
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
              <TableCell><Badge variant="secondary">{et.duration_minutes} min</Badge></TableCell>
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
                <Label>Duration</Label>
                <Select value={form.duration} onValueChange={v => setForm(f => ({ ...f, duration: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60].map(d => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
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
      supabase.from("team_members").select("*"),
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
