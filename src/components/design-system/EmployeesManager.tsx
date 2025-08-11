import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
}

const EmployeesManager = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [newEmp, setNewEmp] = useState<Omit<Employee, "id">>({
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    image_url: "",
    sort_order: 0,
    active: true,
  } as any);

  const load = async () => {
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

  useEffect(() => {
    load();
  }, []);

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
      setNewEmp({ name: "", title: "", email: "", phone: "", linkedin_url: "", image_url: "", sort_order: 0, active: true } as any);
      setFile(null);
      load();
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
      load();
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

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Employees CMS</h2>
        <p className="text-muted-foreground">Manage your public team page members.</p>
      </header>

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
                  <div className="grid gap-2">
                    <Label>Sort order</Label>
                    <Input type="number" value={e.sort_order ?? 0} onChange={(ev) => setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, sort_order: Number(ev.target.value) } : x))} />
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
