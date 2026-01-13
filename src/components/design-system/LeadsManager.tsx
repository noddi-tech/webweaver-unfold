import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Building2, Mail, Phone, Globe, Calendar, 
  User, Loader2, MoreHorizontal, Pencil, Trash2, FileText,
  TrendingUp, DollarSign, MapPin
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';

interface Lead {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  status: LeadStatus;
  source: string | null;
  source_detail: string | null;
  estimated_locations: number | null;
  estimated_revenue: number | null;
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500' },
  qualified: { label: 'Qualified', color: 'bg-purple-500' },
  proposal_sent: { label: 'Proposal Sent', color: 'bg-orange-500' },
  negotiating: { label: 'Negotiating', color: 'bg-cyan-500' },
  won: { label: 'Won', color: 'bg-green-500' },
  lost: { label: 'Lost', color: 'bg-red-500' },
};

export function LeadsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    status: 'new' as LeadStatus,
    source: '',
    source_detail: '',
    estimated_locations: '',
    estimated_revenue: '',
    notes: '',
    next_follow_up_at: '',
  });

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Fetch linked offers count for each lead
  const { data: offerCounts = {} } = useQuery({
    queryKey: ['lead-offer-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_offers')
        .select('lead_id')
        .not('lead_id', 'is', null);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((offer) => {
        if (offer.lead_id) {
          counts[offer.lead_id] = (counts[offer.lead_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  // Create lead mutation
  const createMutation = useMutation({
    mutationFn: async (data: { company_name: string } & Partial<Omit<Lead, 'company_name'>>) => {
      const { error } = await supabase.from('leads').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create lead: ' + error.message);
    },
  });

  // Update lead mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
      const { error } = await supabase.from('leads').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated');
      setEditingLead(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update lead: ' + error.message);
    },
  });

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete lead: ' + error.message);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      status: 'new',
      source: '',
      source_detail: '',
      estimated_locations: '',
      estimated_revenue: '',
      notes: '',
      next_follow_up_at: '',
    });
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      company_name: lead.company_name,
      contact_name: lead.contact_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      website: lead.website || '',
      industry: lead.industry || '',
      status: lead.status,
      source: lead.source || '',
      source_detail: lead.source_detail || '',
      estimated_locations: lead.estimated_locations?.toString() || '',
      estimated_revenue: lead.estimated_revenue?.toString() || '',
      notes: lead.notes || '',
      next_follow_up_at: lead.next_follow_up_at ? format(new Date(lead.next_follow_up_at), 'yyyy-MM-dd') : '',
    });
  };

  const handleSubmit = () => {
    const data = {
      company_name: formData.company_name,
      contact_name: formData.contact_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      industry: formData.industry || null,
      status: formData.status,
      source: formData.source || null,
      source_detail: formData.source_detail || null,
      estimated_locations: formData.estimated_locations ? parseInt(formData.estimated_locations) : null,
      estimated_revenue: formData.estimated_revenue ? parseInt(formData.estimated_revenue) : null,
      notes: formData.notes || null,
      next_follow_up_at: formData.next_follow_up_at || null,
    };

    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter leads by search query
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.company_name.toLowerCase().includes(query) ||
      lead.contact_name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate summary stats
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    inProgress: leads.filter((l) => ['contacted', 'qualified', 'proposal_sent', 'negotiating'].includes(l.status)).length,
    won: leads.filter((l) => l.status === 'won').length,
    totalPipeline: leads
      .filter((l) => !['won', 'lost'].includes(l.status))
      .reduce((sum, l) => sum + (l.estimated_revenue || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Won</p>
                <p className="text-2xl font-bold">{stats.won}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalPipeline)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>Manage prospects and track your sales pipeline</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen || !!editingLead} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingLead(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                  <DialogDescription>
                    {editingLead ? 'Update lead information' : 'Enter details for the new lead'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@acme.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+47 123 45 678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://acme.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Automotive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LeadStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Locations</Label>
                    <Input
                      type="number"
                      value={formData.estimated_locations}
                      onChange={(e) => setFormData({ ...formData, estimated_locations: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Annual Revenue (€)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_revenue}
                      onChange={(e) => setFormData({ ...formData, estimated_revenue: e.target.value })}
                      placeholder="5000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Follow-up</Label>
                    <Input
                      type="date"
                      value={formData.next_follow_up_at}
                      onChange={(e) => setFormData({ ...formData, next_follow_up_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source Detail</Label>
                    <Input
                      value={formData.source_detail}
                      onChange={(e) => setFormData({ ...formData, source_detail: e.target.value })}
                      placeholder="Referred by John Smith"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this lead..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingLead(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.company_name || createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingLead ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leads found</p>
              <p className="text-sm">Add your first lead to get started</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Revenue</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Offers</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.company_name}</p>
                          {lead.industry && (
                            <p className="text-xs text-muted-foreground">{lead.industry}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.contact_name && (
                            <p className="text-sm">{lead.contact_name}</p>
                          )}
                          {lead.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: lead.id, status: v as LeadStatus })}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[lead.status].color}`} />
                              <span className="text-xs">{STATUS_CONFIG[lead.status].label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([value, { label, color }]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${color}`} />
                                  {label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {lead.estimated_revenue ? formatCurrency(lead.estimated_revenue) : '-'}
                      </TableCell>
                      <TableCell>
                        {lead.estimated_locations || '-'}
                      </TableCell>
                      <TableCell>
                        {offerCounts[lead.id] ? (
                          <Badge variant="secondary" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {offerCounts[lead.id]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.next_follow_up_at ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.next_follow_up_at), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(lead)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm('Delete this lead?')) {
                                  deleteMutation.mutate(lead.id);
                                }
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LeadsManager;
