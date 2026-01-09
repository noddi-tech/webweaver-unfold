import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, TrendingUp, Briefcase, Target, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { format, subDays, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  interview_scheduled: "Interview Scheduled",
  interview_completed: "Interview Completed",
  offer_extended: "Offer Extended",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const FUNNEL_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#22c55e"];

const PIPELINE_ORDER = ["submitted", "under_review", "interview_scheduled", "interview_completed", "offer_extended", "hired"];

export function HiringAnalytics() {
  const [dateRange, setDateRange] = useState("90");

  const startDate = useMemo(() => subDays(new Date(), parseInt(dateRange)), [dateRange]);

  // Fetch all applications
  const { data: applications, isLoading: loadingApplications } = useQuery({
    queryKey: ["hiring-analytics-applications", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          status,
          created_at,
          status_updated_at,
          job_id,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          job_listings(id, title, department)
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all job listings
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["hiring-analytics-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_listings")
        .select("id, title, department, active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!applications) return null;

    const totalApplications = applications.length;
    const hiredCount = applications.filter(a => a.status === "hired").length;
    const activePositions = jobs?.filter(j => j.active).length || 0;

    // Calculate average time to hire (for hired candidates)
    const hiredApplications = applications.filter(a => a.status === "hired" && a.status_updated_at);
    let averageTimeToHire = 0;
    if (hiredApplications.length > 0) {
      const totalDays = hiredApplications.reduce((sum, app) => {
        const days = differenceInDays(new Date(app.status_updated_at!), new Date(app.created_at!));
        return sum + days;
      }, 0);
      averageTimeToHire = Math.round(totalDays / hiredApplications.length);
    }

    // Conversion rate
    const conversionRate = totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(1) : "0";

    // Applications by status
    const byStatus: Record<string, number> = {};
    applications.forEach(app => {
      byStatus[app.status || "submitted"] = (byStatus[app.status || "submitted"] || 0) + 1;
    });

    return {
      totalApplications,
      hiredCount,
      averageTimeToHire,
      conversionRate,
      activePositions,
      byStatus,
    };
  }, [applications, jobs]);

  // Funnel data
  const funnelData = useMemo(() => {
    if (!metrics?.byStatus) return [];

    return PIPELINE_ORDER
      .filter(status => status !== "rejected" && status !== "withdrawn")
      .map((status, index) => ({
        name: STATUS_LABELS[status],
        value: PIPELINE_ORDER.slice(0, index + 1).reduce((sum, s) => sum + (metrics.byStatus[s] || 0), 0),
        fill: FUNNEL_COLORS[index] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1],
      }))
      .reverse();
  }, [metrics]);

  // Applications over time
  const applicationsOverTime = useMemo(() => {
    if (!applications) return [];

    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const count = applications.filter(app => {
        const date = new Date(app.created_at!);
        return date >= start && date <= end;
      }).length;

      return {
        month: format(month, "MMM"),
        applications: count,
      };
    });
  }, [applications]);

  // Position performance
  const positionPerformance = useMemo(() => {
    if (!applications || !jobs) return [];

    const performanceMap: Record<string, { title: string; apps: number; hired: number; totalDays: number; hiredCount: number }> = {};

    applications.forEach(app => {
      const jobId = app.job_id;
      const job = app.job_listings as any;
      if (!job) return;

      if (!performanceMap[jobId]) {
        performanceMap[jobId] = {
          title: job.title,
          apps: 0,
          hired: 0,
          totalDays: 0,
          hiredCount: 0,
        };
      }

      performanceMap[jobId].apps++;
      if (app.status === "hired") {
        performanceMap[jobId].hired++;
        if (app.status_updated_at) {
          performanceMap[jobId].totalDays += differenceInDays(new Date(app.status_updated_at), new Date(app.created_at!));
          performanceMap[jobId].hiredCount++;
        }
      }
    });

    return Object.values(performanceMap)
      .map(p => ({
        ...p,
        avgTimeToHire: p.hiredCount > 0 ? Math.round(p.totalDays / p.hiredCount) : null,
      }))
      .sort((a, b) => b.apps - a.apps)
      .slice(0, 10);
  }, [applications, jobs]);

  // Source effectiveness data
  const sourceEffectiveness = useMemo(() => {
    if (!applications) return [];

    const sourceMap: Record<string, { source: string; apps: number; hired: number; interviews: number }> = {};

    applications.forEach(app => {
      const sourceName = (app as any).source || "Direct";
      if (!sourceMap[sourceName]) {
        sourceMap[sourceName] = { source: sourceName, apps: 0, hired: 0, interviews: 0 };
      }
      sourceMap[sourceName].apps++;
      if (app.status === "hired") {
        sourceMap[sourceName].hired++;
      }
      if (["interview_scheduled", "interview_completed"].includes(app.status || "")) {
        sourceMap[sourceName].interviews++;
      }
    });

    return Object.values(sourceMap)
      .map(s => ({
        ...s,
        conversionRate: s.apps > 0 ? ((s.hired / s.apps) * 100).toFixed(1) : "0",
        interviewRate: s.apps > 0 ? ((s.interviews / s.apps) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.apps - a.apps);
  }, [applications]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    if (!metrics?.byStatus) return [];

    return Object.entries(metrics.byStatus)
      .filter(([status]) => !["rejected", "withdrawn"].includes(status))
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
      }));
  }, [metrics]);

  const isLoading = loadingApplications || loadingJobs;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hiring Analytics</h2>
          <p className="text-muted-foreground">Overview of your recruitment performance</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.averageTimeToHire || 0} <span className="text-lg font-normal">days</span></div>
            <p className="text-xs text-muted-foreground mt-1">From application to hire</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hire Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics?.hiredCount || 0} hired of {metrics?.totalApplications || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.activePositions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently hiring</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pipeline Funnel
            </CardTitle>
            <CardDescription>Candidate progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PIPELINE_ORDER.filter(s => !["rejected", "withdrawn"].includes(s)).map((status, index) => {
                const count = metrics?.byStatus[status] || 0;
                const maxCount = metrics?.byStatus["submitted"] || 1;
                const percentage = Math.round((count / maxCount) * 100);
                
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-muted-foreground">{STATUS_LABELS[status]}</div>
                    <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, 5)}%`,
                          backgroundColor: FUNNEL_COLORS[index] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1],
                        }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Applications Over Time
            </CardTitle>
            <CardDescription>Monthly application trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current pipeline breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {statusDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Position Performance Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Position Performance</CardTitle>
            <CardDescription>Applications and hires by position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Position</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Applications</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Hired</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Avg. Days</th>
                  </tr>
                </thead>
                <tbody>
                  {positionPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    positionPerformance.map((pos, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{pos.title}</td>
                        <td className="text-right py-3 px-2">{pos.apps}</td>
                        <td className="text-right py-3 px-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {pos.hired}
                          </span>
                        </td>
                        <td className="text-right py-3 px-2 text-muted-foreground">
                          {pos.avgTimeToHire !== null ? `${pos.avgTimeToHire}d` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Source Effectiveness
          </CardTitle>
          <CardDescription>Where your best candidates come from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceEffectiveness} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="source" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="apps" fill="#6366f1" name="Applications" />
                <Bar dataKey="hired" fill="#22c55e" name="Hired" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Source</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Apps</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Interviews</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Hired</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Conv. %</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceEffectiveness.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No source data yet
                      </td>
                    </tr>
                  ) : (
                    sourceEffectiveness.map((src, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium capitalize">{src.source}</td>
                        <td className="text-right py-2 px-2">{src.apps}</td>
                        <td className="text-right py-2 px-2">{src.interviews}</td>
                        <td className="text-right py-2 px-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {src.hired}
                          </span>
                        </td>
                        <td className="text-right py-2 px-2 text-muted-foreground">{src.conversionRate}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
