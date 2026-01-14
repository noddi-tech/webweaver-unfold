import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, CheckCircle, Eye, MousePointer, AlertTriangle, Clock, TrendingUp, Send } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useState } from "react";

interface EmailLog {
  id: string;
  email_type: string;
  to_email: string;
  to_name: string | null;
  from_address: string;
  subject: string;
  status: string;
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "Sent", color: "bg-blue-500", icon: Send },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle },
  opened: { label: "Opened", color: "bg-purple-500", icon: Eye },
  clicked: { label: "Clicked", color: "bg-indigo-500", icon: MousePointer },
  bounced: { label: "Bounced", color: "bg-red-500", icon: AlertTriangle },
  complained: { label: "Complained", color: "bg-orange-500", icon: AlertTriangle },
  delayed: { label: "Delayed", color: "bg-yellow-500", icon: Clock },
};

const emailTypeLabels: Record<string, string> = {
  pricing_offer: "Pricing Offer",
  offer_question: "Offer Question",
  application_confirmation: "Application Confirmation",
  application_status: "Application Status",
  interview_invitation: "Interview Invitation",
  booking_link: "Booking Link",
  candidate_message: "Candidate Message",
  feedback_reminder: "Feedback Reminder",
};

export const EmailAnalyticsDashboard = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch email logs
  const { data: emailLogs, isLoading } = useQuery({
    queryKey: ["email-logs", typeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);

      if (typeFilter !== "all") {
        query = query.eq("email_type", typeFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmailLog[];
    },
  });

  // Calculate stats
  const stats = emailLogs ? {
    total: emailLogs.length,
    delivered: emailLogs.filter(e => ["delivered", "opened", "clicked"].includes(e.status)).length,
    opened: emailLogs.filter(e => ["opened", "clicked"].includes(e.status)).length,
    clicked: emailLogs.filter(e => e.status === "clicked").length,
    bounced: emailLogs.filter(e => e.status === "bounced").length,
    deliveryRate: emailLogs.length > 0 
      ? Math.round((emailLogs.filter(e => ["delivered", "opened", "clicked"].includes(e.status)).length / emailLogs.length) * 100)
      : 0,
    openRate: emailLogs.filter(e => ["delivered", "opened", "clicked"].includes(e.status)).length > 0
      ? Math.round((emailLogs.filter(e => ["opened", "clicked"].includes(e.status)).length / emailLogs.filter(e => ["delivered", "opened", "clicked"].includes(e.status)).length) * 100)
      : 0,
    clickRate: emailLogs.filter(e => ["opened", "clicked"].includes(e.status)).length > 0
      ? Math.round((emailLogs.filter(e => e.status === "clicked").length / emailLogs.filter(e => ["opened", "clicked"].includes(e.status)).length) * 100)
      : 0,
  } : null;

  const StatCard = ({ 
    title, 
    value, 
    subValue, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    subValue?: string; 
    icon: React.ComponentType<{ className?: string }>; 
    color: string; 
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Emails Sent"
          value={stats?.total || 0}
          subValue="Last 100 emails"
          icon={Mail}
          color="bg-blue-500"
        />
        <StatCard
          title="Delivery Rate"
          value={`${stats?.deliveryRate || 0}%`}
          subValue={`${stats?.delivered || 0} delivered`}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Open Rate"
          value={`${stats?.openRate || 0}%`}
          subValue={`${stats?.opened || 0} opened`}
          icon={Eye}
          color="bg-purple-500"
        />
        <StatCard
          title="Click Rate"
          value={`${stats?.clickRate || 0}%`}
          subValue={`${stats?.clicked || 0} clicked`}
          icon={MousePointer}
          color="bg-indigo-500"
        />
      </div>

      {/* Bounced/Issues Alert */}
      {stats && stats.bounced > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                {stats.bounced} email{stats.bounced > 1 ? "s" : ""} bounced
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Check the logs below for details and consider verifying recipient addresses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>Recent emails sent from the system</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(emailTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emailLogs && emailLogs.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => {
                    const config = statusConfig[log.status] || statusConfig.sent;
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={`${config.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {emailTypeLabels[log.email_type] || log.email_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{log.to_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{log.to_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm truncate max-w-[200px] block">
                            {log.subject}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.sent_at), "d. MMM HH:mm", { locale: nb })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {log.opened_at ? (
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(log.opened_at), "d. MMM HH:mm", { locale: nb })}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email logs found</p>
              <p className="text-sm">Send some emails to see analytics here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalyticsDashboard;
