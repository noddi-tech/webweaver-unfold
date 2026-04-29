import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PortalCmsLayout } from "./PortalCmsLayout";
import type { InvestorEventRow, InvestorPledgeRow, InvestorSessionRow, InvestorSummary } from "./types";
import { downloadCsv, formatDate, formatDwell, formatNok, formatRelative, truncateIp } from "./utils";

function useInvestorSummaries() {
  return useQuery({
    queryKey: ["investor-summary-cms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investor_summary_for_cms").select("*");
      if (error) throw error;
      return data as InvestorSummary[];
    },
  });
}

export function InvestorsList() {
  const [search, setSearch] = useState("");
  const { data = [] } = useInvestorSummaries();
  const filtered = useMemo(() => data.filter((row) => [row.name, row.firm, row.email].join(" ").toLowerCase().includes(search.toLowerCase())).sort((a, b) => new Date(b.last_seen_at ?? 0).getTime() - new Date(a.last_seen_at ?? 0).getTime()), [data, search]);
  const totalDwell = filtered.reduce((sum, row) => sum + (row.total_dwell_seconds ?? 0), 0);
  const ndaRate = filtered.length ? Math.round(filtered.filter((row) => row.has_accepted_nda).length / filtered.length * 100) : 0;
  return <PortalCmsLayout title="Investor sessions" description="Read-only investor engagement analytics." action={<Button variant="outline" onClick={() => downloadCsv("investor-sessions.csv", filtered as unknown as Record<string, unknown>[])}>Export CSV</Button>}>
    <div className="mb-6 grid gap-4 md:grid-cols-4"><Stat title="Total unique investors" value={filtered.length} /><Stat title="Active last 7 days" value={filtered.filter((row) => row.last_seen_at && Date.now() - new Date(row.last_seen_at).getTime() < 7 * 86400000).length} /><Stat title="Total dwell time" value={formatDwell(totalDwell)} /><Stat title="NDA acceptance rate" value={`${ndaRate}%`} /></div>
    <Card><CardHeader><CardTitle>Investors</CardTitle><CardDescription><Input placeholder="Search name, firm, or email" value={search} onChange={(e) => setSearch(e.target.value)} /></CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Firm</TableHead><TableHead>Email</TableHead><TableHead>Total visits</TableHead><TableHead>Total dwell</TableHead><TableHead>Last seen</TableHead><TableHead>NDA</TableHead><TableHead>Pledge</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((row) => <TableRow key={row.email ?? row.name}><TableCell>{row.name ?? "—"}</TableCell><TableCell>{row.firm ?? "—"}</TableCell><TableCell>{row.email}</TableCell><TableCell>{row.total_visits ?? 0}</TableCell><TableCell>{formatDwell(row.total_dwell_seconds)}</TableCell><TableCell>{formatRelative(row.last_seen_at)}</TableCell><TableCell>{row.has_accepted_nda ? <Badge className="bg-green-500/10 text-green-700 border-green-500/30" variant="outline">✓</Badge> : <Badge variant="outline">—</Badge>}</TableCell><TableCell>{row.has_pledge ? <Badge className="bg-green-500/10 text-green-700 border-green-500/30" variant="outline">✓ {formatNok(row.pledge_amount_nok)}</Badge> : <Badge variant="outline">—</Badge>}</TableCell><TableCell>{row.email ? <Button asChild size="sm" variant="outline"><Link to={`/cms/investors/${encodeURIComponent(row.email)}`}><Eye className="h-4 w-4" /> View</Link></Button> : null}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </PortalCmsLayout>;
}

function Stat({ title, value }: { title: string; value: string | number }) { return <Card><CardHeader className="pb-2"><CardDescription>{title}</CardDescription><CardTitle>{value}</CardTitle></CardHeader></Card>; }

export function InvestorDetail() {
  const { email: encoded } = useParams(); const email = decodeURIComponent(encoded ?? ""); const [open, setOpen] = useState(false); const [page, setPage] = useState(0);
  const { data: summaries = [] } = useInvestorSummaries(); const summary = summaries.find((row) => row.email === email);
  const { data: sessions = [] } = useQuery({ queryKey: ["investor-sessions", email], queryFn: async () => { const { data, error } = await supabase.from("investor_sessions").select("*").eq("email", email).order("started_at", { ascending: false }); if (error) throw error; return data as InvestorSessionRow[]; } });
  const { data: events = [] } = useQuery({ queryKey: ["investor-events", email], queryFn: async () => { const { data, error } = await supabase.from("investor_events").select("*").eq("email", email).order("created_at", { ascending: false }); if (error) throw error; return data as InvestorEventRow[]; } });
  const { data: pledge } = useQuery({ queryKey: ["investor-pledge", email], queryFn: async () => { const { data, error } = await supabase.from("investor_pledges").select("*").eq("email", email).maybeSingle(); if (error) throw error; return data as InvestorPledgeRow | null; } });
  const eventCounts = useMemo(() => { const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().slice(0, 10); }); return days.map((day) => ({ day: day.slice(5), count: events.filter((e) => e.created_at.slice(0, 10) === day).length })); }, [events]);
  const paged = events.slice(page * 25, page * 25 + 25);
  return <PortalCmsLayout title="Investor detail" description={email}>
    <Card className="mb-6"><CardHeader><CardTitle>{summary?.name ?? email}</CardTitle><CardDescription>{summary?.firm ?? "No firm"} · {email}</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><p>First seen<br/><strong>{formatDate(summary?.first_seen_at)}</strong></p><p>Last seen<br/><strong>{formatRelative(summary?.last_seen_at)}</strong></p><p>Total visits<br/><strong>{summary?.total_visits ?? 0}</strong></p><p>Total dwell<br/><strong>{formatDwell(summary?.total_dwell_seconds)}</strong></p><p>NDA<br/><strong>{summary?.has_accepted_nda ? `Accepted ${formatDate(summary.nda_accepted_at)}` : "—"}</strong></p><p>Pledge<br/><strong>{pledge ? formatNok(pledge.amount_nok) : "—"}</strong></p></CardContent></Card>
    <Card className="mb-6"><CardHeader><CardTitle>Sessions</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Started</TableHead><TableHead>IP</TableHead><TableHead>User agent</TableHead><TableHead>Dwell</TableHead><TableHead>Events</TableHead></TableRow></TableHeader><TableBody>{sessions.map((s) => <TableRow key={s.id}><TableCell>{formatDate(s.started_at)}</TableCell><TableCell>{truncateIp(s.ip_address)}</TableCell><TableCell className="max-w-sm truncate" title={s.user_agent ?? ""}>{s.user_agent ?? "—"}</TableCell><TableCell>{formatDwell(s.total_dwell_seconds)}</TableCell><TableCell>{events.filter((e) => e.session_id === s.id).length}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Card className="mb-6"><CardHeader><CardTitle>Engagement timeline</CardTitle></CardHeader><CardContent><ChartContainer config={{ count: { label: "Events", color: "hsl(var(--primary))" } }}><BarChart data={eventCounts}><CartesianGrid vertical={false} /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="count" fill="var(--color-count)" radius={4} /></BarChart></ChartContainer></CardContent></Card>
    {pledge ? <Card className="mb-6"><CardHeader><CardTitle>Pledge details</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><p>Amount<br/><strong>{formatNok(pledge.amount_nok)}</strong></p><p>Firm<br/><strong>{pledge.is_firm ? "Yes" : "No"}</strong></p><p>Lead intent<br/><strong>{pledge.lead_intent ?? "—"}</strong></p><p>Updated<br/><strong>{formatDate(pledge.updated_at)}</strong></p><p className="md:col-span-2">Conditions<br/>{pledge.conditions ?? "—"}</p><p className="md:col-span-2">Notes<br/>{pledge.notes ?? "—"}</p></CardContent></Card> : null}
    <Collapsible open={open} onOpenChange={setOpen}><Card><CardHeader><CollapsibleTrigger asChild><Button variant="outline">{open ? "Hide" : "Show"} raw events log</Button></CollapsibleTrigger></CardHeader><CollapsibleContent><CardContent><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Path</TableHead><TableHead>Payload</TableHead><TableHead>Dwell</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{paged.map((e) => <TableRow key={e.id}><TableCell>{e.event_type}</TableCell><TableCell>{e.path ?? "—"}</TableCell><TableCell><pre className="max-w-md overflow-auto text-xs">{JSON.stringify(e.payload, null, 2)}</pre></TableCell><TableCell>{formatDwell(e.dwell_seconds)}</TableCell><TableCell>{formatDate(e.created_at)}</TableCell></TableRow>)}</TableBody></Table><div className="mt-4 flex gap-2"><Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" disabled={(page + 1) * 25 >= events.length} onClick={() => setPage(page + 1)}>Next</Button></div></CardContent></CollapsibleContent></Card></Collapsible>
  </PortalCmsLayout>;
}

export function PledgesDashboard() {
  const { data: pledges = [] } = useQuery({ queryKey: ["investor-pledges-cms"], queryFn: async () => { const { data, error } = await supabase.from("investor_pledges").select("*").order("updated_at", { ascending: false }); if (error) throw error; return data as InvestorPledgeRow[]; } });
  const { data: summaries = [] } = useInvestorSummaries();
  const rows = pledges.map((pledge) => ({ ...pledge, summary: summaries.find((s) => s.email === pledge.email) }));
  const total = pledges.reduce((sum, p) => sum + p.amount_nok, 0); const firm = pledges.filter((p) => p.is_firm).length; const conditional = pledges.filter((p) => p.conditions?.trim()).length; const avg = pledges.length ? Math.round(total / pledges.length) : 0;
  const bins = [{ bin: "0-1M", count: pledges.filter((p) => p.amount_nok < 1_000_000).length }, { bin: "1-2M", count: pledges.filter((p) => p.amount_nok >= 1_000_000 && p.amount_nok < 2_000_000).length }, { bin: "2-5M", count: pledges.filter((p) => p.amount_nok >= 2_000_000 && p.amount_nok < 5_000_000).length }, { bin: "5-10M", count: pledges.filter((p) => p.amount_nok >= 5_000_000 && p.amount_nok < 10_000_000).length }, { bin: "10M+", count: pledges.filter((p) => p.amount_nok >= 10_000_000).length }];
  return <PortalCmsLayout title="Pledges" description="Read-only pledge dashboard." action={<Button variant="outline" onClick={() => downloadCsv("investor-pledges.csv", pledges as unknown as Record<string, unknown>[])}>Export CSV</Button>}>
    <div className="mb-6 grid gap-4 md:grid-cols-5"><Stat title="Total pledged NOK" value={formatNok(total)} /><Stat title="Number of pledges" value={pledges.length} /><Stat title="Number firm" value={firm} /><Stat title="Number conditional" value={conditional} /><Stat title="Average ticket NOK" value={formatNok(avg)} /></div>
    <Card className="mb-6"><CardHeader><CardTitle>Ticket distribution</CardTitle></CardHeader><CardContent><ChartContainer config={{ count: { label: "Pledges", color: "hsl(var(--primary))" } }}><BarChart data={bins}><CartesianGrid vertical={false} /><XAxis dataKey="bin" /><YAxis allowDecimals={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="count" fill="var(--color-count)" radius={4} /></BarChart></ChartContainer></CardContent></Card>
    <Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Investor</TableHead><TableHead>Email</TableHead><TableHead>Amount NOK</TableHead><TableHead>Is firm</TableHead><TableHead>Lead intent</TableHead><TableHead>Updated at</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell>{row.summary?.name ?? row.name}<br/><span className="text-xs text-muted-foreground">{row.summary?.firm ?? row.firm ?? "—"}</span></TableCell><TableCell>{row.email}</TableCell><TableCell>{formatNok(row.amount_nok)}</TableCell><TableCell><Badge variant={row.is_firm ? "default" : "outline"}>{row.is_firm ? "Firm" : "Soft"}</Badge></TableCell><TableCell>{row.lead_intent ?? "—"}</TableCell><TableCell>{formatDate(row.updated_at)}</TableCell><TableCell><Button asChild size="sm" variant="outline"><Link to={`/cms/investors/${encodeURIComponent(row.email)}`}>View investor</Link></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </PortalCmsLayout>;
}
