import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmojiPicker from "@/components/ui/emoji-picker";
import { Plus, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  image_url: string | null;
  sort_order: number | null;
  active: boolean;
  section: string;
}

interface EmpSection { id: string; name: string; sort_order: number | null; }

interface EmployeeSettings {
  id?: string;
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  name_token: string;
  title_token: string;
  link_token: string;
}

const bgOptions = ["background", "card", "primary", "secondary", "accent", "gradient-primary", "gradient-background", "gradient-hero"];
const textOptions = ["foreground", "muted-foreground", "primary", "secondary", "accent"];
const borderOptions = ["border"];

const EmployeesManager = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sections, setSections] = useState<EmpSection[]>([]);
  const [newSection, setNewSection] = useState("");
  const [settings, setSettings] = useState<EmployeeSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EmpSection | null>(null);
  const [newEmp, setNewEmp] = useState<Omit<Employee, "id">>({
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    image_url: "",
    sort_order: 0,
    active: true,
    section: "General",
  } as any);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("employees")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setEmployees(data || []);
    setLoading(false);
  };

  const fetchSections = async () => {
    const { data, error } = await (supabase as any)
      .from("employees_sections")
      .select("id,name,sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    // Ensure default "General" section exists
    const hasGeneral = (data || []).some((s: EmpSection) => s.name === "General");
    if (!hasGeneral) {
      const { error: insertErr } = await (supabase as any)
        .from("employees_sections")
        .insert({ name: "General", sort_order: 0 } as any);
      if (insertErr) {
        console.error(insertErr);
      } else {
        const { data: refetched } = await (supabase as any)
          .from("employees_sections")
          .select("id,name,sort_order")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });
        setSections(refetched || []);
        return;
      }
    }
    setSections(data || []);
  };

  const fetchSettings = async () => {
    const { data, error } = await (supabase as any)
      .from("employees_settings")
      .select("id,section_title,section_subtitle,background_token,card_bg_token,border_token,name_token,title_token,link_token")
      .order("created_at", { ascending: true })
      .limit(1);
    if (error) {
      console.error(error);
      return;
    }
    setSettings((data && data[0]) || {
      section_title: "Our Team",
      section_subtitle: null,
      background_token: "background",
      card_bg_token: "card",
      border_token: "border",
      name_token: "foreground",
      title_token: "muted-foreground",
      link_token: "primary",
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchSections();
    fetchSettings();
  }, []);

  const addSection = async () => {
    const name = newSection.trim();
    if (!name) return;
    const { error } = await (supabase as any).from("employees_sections").insert({ name });
    if (error) {
      toast({ title: "Add section failed", description: error.message, variant: "destructive" });
      return;
    }
    setNewSection("");
    toast({ title: "Section added" });
    fetchSections();
  };

  const deleteSection = (id: string) => {
    const s = sections.find((x) => x.id === id) || null;
    if (s) setPendingDelete(s);
  };

  const confirmDeleteSection = async () => {
    if (!pendingDelete) return;
    const { error } = await (supabase as any).from("employees_sections").delete().eq("id", pendingDelete.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Section deleted", description: `${pendingDelete.name} removed.` });
      fetchSections();
    }
    setPendingDelete(null);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `employees/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await (supabase as any).storage.from("site-images").upload(path, file);
    if (upErr) throw upErr;
    const { data } = (supabase as any).storage.from("site-images").getPublicUrl(path);
    return data.publicUrl as string;
  };

  const create = async () => {
    if (!newEmp.name.trim() || !newEmp.title.trim()) {
      toast({ title: "Name and title are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      let image_url = newEmp.image_url || null;
      if (file) image_url = await uploadImage(file);
      const payload: any = {
        ...newEmp,
        image_url,
        sort_order: Number(newEmp.sort_order ?? 0),
        email: newEmp.email || null,
        phone: newEmp.phone || null,
        linkedin_url: newEmp.linkedin_url || null,
      };
      const { error } = await (supabase as any).from("employees").insert(payload);
      if (error) throw error;
      toast({ title: "Employee created" });
      setNewEmp({ name: "", title: "", email: "", phone: "", linkedin_url: "", image_url: "", sort_order: 0, active: true, section: "General" } as any);
      setFile(null);
      fetchEmployees();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const save = async (e: Employee) => {
    setSavingId(e.id);
    try {
      const { id, ...rest } = e as any;
      const payload = {
        ...rest,
        sort_order: Number(e.sort_order ?? 0),
        email: e.email || null,
        phone: e.phone || null,
        linkedin_url: e.linkedin_url || null,
      };
      const { error } = await (supabase as any).from("employees").update(payload).eq("id", e.id);
      if (error) throw error;
      toast({ title: "Saved" });
      fetchEmployees();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await (supabase as any).from("employees").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      setEmployees((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const payload: any = { ...settings };
    if (!payload.id) delete payload.id;
    const { error } = await (supabase as any).from("employees_settings").upsert(payload, { onConflict: "id" });
    setSavingSettings(false);
    if (error) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Design settings saved" });
      fetchSettings();
    }
  };

  const sectionOptions = useMemo(() => {
    const names = new Set<string>(sections.map((s) => s.name));
    employees.forEach((e) => names.add(e.section || "General"));
    if (!names.has("General")) names.add("General");
    return Array.from(names);
  }, [sections, employees]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Employees CMS</h2>
        <p className="text-muted-foreground">Manage your public team page members and styling.</p>
      </header>

      {/* Design Settings */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4">Design Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Section Title</Label>
            <Input value={settings?.section_title ?? ""} onChange={(e) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), section_title: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Section Subtitle</Label>
            <Input value={settings?.section_subtitle ?? ""} onChange={(e) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), section_subtitle: e.target.value }))} />
          </div>
          <div>
            <Label>Card Background</Label>
            <Select value={settings?.card_bg_token ?? "card"} onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), card_bg_token: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {bgOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Border</Label>
            <Select value={settings?.border_token ?? "border"} onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), border_token: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {borderOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Name Color</Label>
            <Select value={settings?.name_token ?? "foreground"} onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), name_token: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {textOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title Color</Label>
            <Select value={settings?.title_token ?? "muted-foreground"} onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), title_token: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {textOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Link Color</Label>
            <Select value={settings?.link_token ?? "primary"} onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as EmployeeSettings)), link_token: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {textOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={saveSettings} disabled={savingSettings}>{savingSettings ? "Saving..." : "Save Design Settings"}</Button>
        </div>
      </Card>

      {/* Sections Management */}
      <Card className="p-6 bg-card border-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">Sections</h3>
          </div>

          {sections.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current sections</p>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <div key={s.id} className="relative inline-block px-2 py-1 pr-5 rounded-md border border-border text-sm text-foreground">
                    <span>{s.name}</span>
                    <button
                      type="button"
                      aria-label={`Delete section ${s.name}`}
                      onClick={() => setPendingDelete(s)}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sections yet. Add your first section below.</p>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid gap-2">
              <Label htmlFor="new-emp-section">Add new section</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="w-full"
                  id="new-emp-section"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="e.g. Tech, Admin"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end sm:justify-start">
              <EmojiPicker onSelect={(e) => setNewSection((prev) => prev + e)} />
              <Button onClick={addSection} disabled={!newSection.trim()}>
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the section "{pendingDelete?.name}". Employees will keep their section text but it may no longer be listed here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSection}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Create Employee */}
      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="text-xl font-semibold">Add Employee</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={newEmp.name} onChange={(e) => setNewEmp((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={newEmp.title} onChange={(e) => setNewEmp((s) => ({ ...s, title: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Section</Label>
            <Select value={newEmp.section} onValueChange={(v) => setNewEmp((s) => ({ ...s, section: v }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {sectionOptions.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Sort order</Label>
            <Input type="number" value={newEmp.sort_order ?? 0} onChange={(e) => setNewEmp((s) => ({ ...s, sort_order: Number(e.target.value) }))} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={newEmp.email ?? ""} onChange={(e) => setNewEmp((s) => ({ ...s, email: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={newEmp.phone ?? ""} onChange={(e) => setNewEmp((s) => ({ ...s, phone: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>LinkedIn URL</Label>
            <Input value={newEmp.linkedin_url ?? ""} onChange={(e) => setNewEmp((s) => ({ ...s, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="grid gap-2 lg:col-span-3">
            <Label>Image</Label>
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Input placeholder="or paste image URL" value={newEmp.image_url ?? ""} onChange={(e) => setNewEmp((s) => ({ ...s, image_url: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={create} disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
        </div>
      </Card>

      {/* Manage Employees */}
      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="text-xl font-semibold">Team Members ({employees.length})</h3>
        <Separator />
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : employees.length === 0 ? (
          <p className="text-muted-foreground">No members yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {employees.map((e) => (
              <div key={e.id} className="grid gap-3 rounded-lg border border-border p-4 bg-background">
                {e.image_url && (
                  <img src={e.image_url} alt={`${e.name} – ${e.title}`} className="w-full h-40 object-cover rounded-md" loading="lazy" />
                )}
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={e.name} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, name: ev.target.value } : x))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input value={e.title} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, title: ev.target.value } : x))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Section</Label>
                    <Select value={e.section} onValueChange={(v) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, section: v } : x))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {sectionOptions.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Sort order</Label>
                    <Input type="number" value={e.sort_order ?? 0} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, sort_order: Number(ev.target.value) } : x))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={e.email ?? ""} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, email: ev.target.value } : x))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={e.phone ?? ""} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, phone: ev.target.value } : x))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>LinkedIn URL</Label>
                    <Input value={e.linkedin_url ?? ""} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, linkedin_url: ev.target.value } : x))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Image URL</Label>
                    <Input value={e.image_url ?? ""} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, image_url: ev.target.value } : x))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => save(e)} disabled={savingId === e.id}>{savingId === e.id ? "Saving..." : "Save"}</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(e.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
};

export default EmployeesManager;
