import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Users, Mail, Eye, CheckCircle, Clock, MessageCircle, 
  Briefcase, DollarSign, Bell, TrendingUp, Calendar
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: 'offer_created' | 'offer_viewed' | 'offer_accepted' | 'application_new' | 'application_status' | 
        'newsletter_signup' | 'lead_new' | 'email_sent' | 'email_opened' | 'interview_scheduled';
  category: 'sales' | 'careers' | 'communications';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export default function ActivityDashboard() {
  // Fetch recent offers
  const { data: offers = [] } = useQuery({
    queryKey: ["activity-offers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pricing_offers")
        .select("id, customer_company, customer_name, status, created_at, viewed_at, accepted_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch recent applications
  const { data: applications = [] } = useQuery({
    queryKey: ["activity-applications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_applications")
        .select("id, applicant_name, applicant_email, status, created_at, job_id")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch recent leads
  const { data: leads = [] } = useQuery({
    queryKey: ["activity-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, company_name, contact_name, status, created_at, source")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch recent email logs
  const { data: emails = [] } = useQuery({
    queryKey: ["activity-emails"],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_logs")
        .select("id, email_type, to_name, to_email, status, created_at, opened_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch recent interviews
  const { data: interviews = [] } = useQuery({
    queryKey: ["activity-interviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("interviews")
        .select("id, title, scheduled_at, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Build activity feed
  const activities: ActivityItem[] = [
    // Offers
    ...offers.flatMap((offer): ActivityItem[] => {
      const items: ActivityItem[] = [];
      items.push({
        id: `offer-created-${offer.id}`,
        type: 'offer_created',
        category: 'sales',
        title: `New offer created`,
        description: `Offer for ${offer.customer_company || 'Unknown company'}`,
        timestamp: offer.created_at,
      });
      if (offer.viewed_at) {
        items.push({
          id: `offer-viewed-${offer.id}`,
          type: 'offer_viewed',
          category: 'sales',
          title: `Offer viewed`,
          description: `${offer.customer_name} viewed their offer`,
          timestamp: offer.viewed_at,
        });
      }
      if (offer.accepted_at) {
        items.push({
          id: `offer-accepted-${offer.id}`,
          type: 'offer_accepted',
          category: 'sales',
          title: `Offer accepted! 🎉`,
          description: `${offer.customer_company} accepted the offer`,
          timestamp: offer.accepted_at,
        });
      }
      return items;
    }),
    // Applications
    ...applications.map((app): ActivityItem => ({
      id: `app-${app.id}`,
      type: 'application_new',
      category: 'careers',
      title: `New application`,
      description: `${app.applicant_name} applied`,
      timestamp: app.created_at || '',
      metadata: { status: app.status },
    })),
    // Leads
    ...leads.map((lead): ActivityItem => ({
      id: `lead-${lead.id}`,
      type: 'lead_new',
      category: 'sales',
      title: `New lead`,
      description: `${lead.company_name || lead.contact_name} (${lead.source || 'unknown source'})`,
      timestamp: lead.created_at,
    })),
    // Emails
    ...emails.map((email): ActivityItem => ({
      id: `email-${email.id}`,
      type: email.opened_at ? 'email_opened' : 'email_sent',
      category: 'communications',
      title: email.opened_at ? 'Email opened' : 'Email sent',
      description: `${email.email_type.replace(/_/g, ' ')} to ${email.to_name || email.to_email}`,
      timestamp: email.opened_at || email.created_at || '',
    })),
    // Interviews
    ...interviews.map((interview): ActivityItem => ({
      id: `interview-${interview.id}`,
      type: 'interview_scheduled',
      category: 'careers',
      title: `Interview scheduled`,
      description: interview.title,
      timestamp: interview.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const salesActivities = activities.filter(a => a.category === 'sales');
  const careerActivities = activities.filter(a => a.category === 'careers');
  const commActivities = activities.filter(a => a.category === 'communications');

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'offer_created': return <FileText className="h-4 w-4" />;
      case 'offer_viewed': return <Eye className="h-4 w-4" />;
      case 'offer_accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'application_new': return <Users className="h-4 w-4" />;
      case 'application_status': return <Clock className="h-4 w-4" />;
      case 'newsletter_signup': return <Mail className="h-4 w-4" />;
      case 'lead_new': return <TrendingUp className="h-4 w-4" />;
      case 'email_sent': return <Mail className="h-4 w-4" />;
      case 'email_opened': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: ActivityItem['category']) => {
    switch (category) {
      case 'sales': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Sales</Badge>;
      case 'careers': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Careers</Badge>;
      case 'communications': return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Comms</Badge>;
    }
  };

  const ActivityList = ({ items }: { items: ActivityItem[] }) => (
    <ScrollArea className="h-[500px] pr-4">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {items.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-full bg-muted">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{activity.title}</span>
                  {getCategoryBadge(activity.category)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: nb })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  // Summary stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayActivities = activities.filter(a => new Date(a.timestamp) >= todayStart);
  const todayOffers = todayActivities.filter(a => a.type === 'offer_created').length;
  const todayApplications = todayActivities.filter(a => a.type === 'application_new').length;
  const todayLeads = todayActivities.filter(a => a.type === 'lead_new').length;
  const offerViews = offers.filter(o => o.viewed_at).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Dashboard</h2>
        <p className="text-muted-foreground">Real-time activity across Sales, Careers, and Communications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Offers Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayOffers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Offers Viewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{offerViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Applications Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Leads Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayLeads}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Auto-refreshes every 30 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
              <TabsTrigger value="sales">Sales ({salesActivities.length})</TabsTrigger>
              <TabsTrigger value="careers">Careers ({careerActivities.length})</TabsTrigger>
              <TabsTrigger value="communications">Comms ({commActivities.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ActivityList items={activities.slice(0, 50)} />
            </TabsContent>
            <TabsContent value="sales">
              <ActivityList items={salesActivities} />
            </TabsContent>
            <TabsContent value="careers">
              <ActivityList items={careerActivities} />
            </TabsContent>
            <TabsContent value="communications">
              <ActivityList items={commActivities} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
