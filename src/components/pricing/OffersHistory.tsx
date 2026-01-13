import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Send, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

const statusConfig = {
  draft: { label: 'Draft', icon: FileText, variant: 'secondary' as const, color: 'text-muted-foreground' },
  sent: { label: 'Sent', icon: Send, variant: 'default' as const, color: 'text-blue-600' },
  accepted: { label: 'Accepted', icon: CheckCircle, variant: 'default' as const, color: 'text-green-600' },
  expired: { label: 'Expired', icon: Clock, variant: 'destructive' as const, color: 'text-red-600' },
  rejected: { label: 'Rejected', icon: XCircle, variant: 'destructive' as const, color: 'text-red-600' },
};

export function OffersHistory() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ['pricing-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!offers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No offers created yet. Use the form above to create your first offer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Offers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Monthly Est.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => {
              const status = statusConfig[offer.status as keyof typeof statusConfig] || statusConfig.draft;
              const StatusIcon = status.icon;
              const monthlyRevenue = (offer.annual_revenue || 0) / 12;
              const revenueCost = monthlyRevenue * ((offer.revenue_percentage || 0) / 100);
              const totalMonthly = (offer.fixed_monthly || 0) + revenueCost;

              return (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{offer.customer_company}</p>
                      <p className="text-sm text-muted-foreground">{offer.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {offer.tier}
                    </Badge>
                    {(offer.discount_percentage || 0) > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        -{offer.discount_percentage}%
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(offer.total_monthly_estimate || totalMonthly)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className={`gap-1 ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true, locale: nb })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
