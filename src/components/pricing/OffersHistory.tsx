import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Send, Clock, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

const statusConfig = {
  draft: { 
    label: 'Draft', 
    icon: FileText, 
    variant: 'secondary' as const, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
  sent: { 
    label: 'Sent', 
    icon: Send, 
    variant: 'outline' as const, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30'
  },
  viewed: { 
    label: 'Viewed', 
    icon: Eye, 
    variant: 'outline' as const, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30'
  },
  accepted: { 
    label: 'Accepted', 
    icon: CheckCircle, 
    variant: 'default' as const, 
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30'
  },
  expired: { 
    label: 'Expired', 
    icon: Clock, 
    variant: 'outline' as const, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30'
  },
  rejected: { 
    label: 'Rejected', 
    icon: XCircle, 
    variant: 'destructive' as const, 
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30'
  },
};

// Visual progress indicator for offer status journey
const StatusProgress = ({ status }: { status: string }) => {
  const stages = ['draft', 'sent', 'viewed', 'accepted'];
  const currentIndex = stages.indexOf(status);
  const isRejectedOrExpired = status === 'rejected' || status === 'expired';
  
  return (
    <div className="flex items-center gap-0.5 mt-1.5">
      {stages.map((stage, index) => (
        <div
          key={stage}
          className={`h-1 w-5 rounded-full transition-colors ${
            isRejectedOrExpired
              ? index <= 1 ? 'bg-muted-foreground/40' : 'bg-muted'
              : index <= currentIndex 
                ? 'bg-primary' 
                : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
};

const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'de-DE',
  NOK: 'nb-NO',
  SEK: 'sv-SE',
  USD: 'en-US',
  GBP: 'en-GB',
};

export function OffersHistory() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ['pricing-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_offers')
        .select('*, offer_token, currency, conversion_rate')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const formatOfferCurrency = (amount: number, currency: string = 'EUR', conversionRate: number = 1) => {
    const convertedAmount = amount * conversionRate;
    const locale = CURRENCY_LOCALES[currency] || 'en-US';
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(convertedAmount);
  };

  const handleViewOffer = (offerToken: string | null) => {
    if (offerToken) {
      window.open(`/offer/${offerToken}`, '_blank');
    }
  };

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
              const offerCurrency = offer.currency || 'EUR';
              const offerConversionRate = offer.conversion_rate || 1;

              return (
                <TableRow 
                  key={offer.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewOffer(offer.offer_token)}
                >
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
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                        -{offer.discount_percentage}%
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatOfferCurrency(
                      offer.total_monthly_estimate || totalMonthly, 
                      offerCurrency, 
                      offerConversionRate
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${status.bgColor}`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {offer.sent_at && offer.status !== 'draft' && (
                          <span className="text-xs text-muted-foreground">
                            Sent {formatDistanceToNow(new Date(offer.sent_at), { addSuffix: false, locale: nb })} ago
                          </span>
                        )}
                        {offer.viewed_at && (
                          <span className="text-xs text-purple-500">
                            Viewed {formatDistanceToNow(new Date(offer.viewed_at), { addSuffix: false, locale: nb })} ago
                          </span>
                        )}
                        <StatusProgress status={offer.status || 'draft'} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true, locale: nb })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOffer(offer.offer_token);
                      }}
                    >
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
