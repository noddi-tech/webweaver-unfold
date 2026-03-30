import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, UserPlus, Shield, Loader2 } from "lucide-react";

interface AuthUser {
  id: string;
  email: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "editor";
}

type RoleOption = "admin" | "editor";

const UserRolesManager = () => {
  const { toast } = useToast();
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add role form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleOption>("editor");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch auth users via edge function
      const { data: usersData, error: usersError } = await supabase.functions.invoke("list-users");
      if (usersError) throw usersError;
      setAuthUsers(usersData || []);

      // Fetch existing roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (rolesError) throw rolesError;
      setUserRoles((rolesData as UserRole[]) || []);
    } catch (err: any) {
      toast({ title: "Error loading users", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getUserEmail = (userId: string) => {
    return authUsers.find((u) => u.id === userId)?.email ?? userId;
  };

  const usersWithRoles = userRoles.map((ur) => ({
    ...ur,
    email: getUserEmail(ur.user_id),
  }));

  const usersWithoutRoles = authUsers.filter(
    (u) => !userRoles.some((r) => r.user_id === u.id)
  );

  const addRole = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: selectedUserId,
        role: selectedRole,
      });
      if (error) throw error;
      toast({ title: "Role added" });
      setSelectedUserId("");
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (roleId: string, newRole: RoleOption) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);
      if (error) throw error;
      toast({ title: "Role updated" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (roleId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
      toast({ title: "Role removed" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add role card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Role
          </CardTitle>
          <CardDescription>Grant a user admin or editor access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1.5 block">User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user…" />
                </SelectTrigger>
                <SelectContent>
                  {usersWithoutRoles.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.email ?? u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Role</label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addRole} disabled={!selectedUserId || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing roles table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Roles
          </CardTitle>
          <CardDescription>{usersWithRoles.length} user(s) with assigned roles</CardDescription>
        </CardHeader>
        <CardContent>
          {usersWithRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No roles assigned yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithRoles.map((ur) => (
                  <TableRow key={ur.id}>
                    <TableCell className="font-medium">{ur.email}</TableCell>
                    <TableCell>
                      <Select
                        value={ur.role}
                        onValueChange={(v) => updateRole(ur.id, v as RoleOption)}
                        disabled={saving}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRole(ur.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesManager;
