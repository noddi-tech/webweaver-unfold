import React from "react";

const StatCard: React.FC<{ label: string; value: string; trend?: string }> = ({ label, value, trend }) => (
  <div className="rounded-xl border border-border p-5 bg-card">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    {trend ? <div className="mt-1 text-xs text-muted-foreground">{trend}</div> : null}
  </div>
);

const DashboardOverview: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Active users" value="2,418" trend="+12% this week" />
      <StatCard label="Conversions" value="4.6%" trend="+0.8%" />
      <StatCard label="MRR" value="$32.4k" trend="+5%" />
    </div>
  );
};

export default DashboardOverview;
