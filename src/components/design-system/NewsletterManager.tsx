import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Mail, Trash2, Users } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  confirmed: boolean;
  unsubscribed_at: string | null;
  source: string | null;
  created_at: string;
}

const NewsletterManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load subscribers", description: error.message, variant: "destructive" });
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const deleteSubscriber = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    setDeleting(null);
    if (error) {
      toast({ title: "Failed to delete subscriber", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subscriber removed" });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Subscribed At", "Source", "Confirmed"];
    const rows = subscribers.map((s) => [
      s.email,
      format(new Date(s.subscribed_at), "yyyy-MM-dd HH:mm"),
      s.source || "unknown",
      s.confirmed ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSubscribers = subscribers.filter((s) => !s.unsubscribed_at);

  if (loading) {
    return (
      <Card className="p-6 bg-background border-border">
        <p className="text-muted-foreground">Loading subscribers...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              {subscribers.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-green-500" />
              {activeSubscribers.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-3xl">
              {subscribers.filter((s) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(s.subscribed_at) > weekAgo;
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions & Table */}
      <Card className="p-6 bg-background border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">
            Newsletter Subscribers ({subscribers.length})
          </h3>
          <Button onClick={exportToCSV} variant="outline" disabled={subscribers.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {subscribers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No subscribers yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{subscriber.source || "unknown"}</Badge>
                  </TableCell>
                  <TableCell>
                    {subscriber.unsubscribed_at ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Unsubscribed
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubscriber(subscriber.id)}
                      disabled={deleting === subscriber.id}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default NewsletterManager;
