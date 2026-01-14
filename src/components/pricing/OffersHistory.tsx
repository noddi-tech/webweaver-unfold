import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Send, Clock, CheckCircle, XCircle, ExternalLink, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { toast } from 'sonner';
import { OfferEditModal } from './OfferEditModal';

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

interface OfferData {
  id: string;
  customer_company: string | null;
  customer_name: string | null;
  customer_email: string | null;
  notes: string | null;
  expires_at: string | null;
  discount_percentage: number | null;
  status: string | null;
  offer_token: string | null;
  currency: string | null;
  conversion_rate: number | null;
  tier: string | null;
  annual_revenue: number | null;
  fixed_monthly: number | null;
  revenue_percentage: number | null;
  total_monthly_estimate: number | null;
  total_yearly_estimate: number | null;
  locations: number | null;
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
}

export function OffersHistory() {
  const queryClient = useQueryClient();
  const [editingOffer, setEditingOffer] = useState<OfferData | null>(null);
  const [deleteOffer, setDeleteOffer] = useState<OfferData | null>(null);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['pricing-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as OfferData[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_offers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-offers'] });
      setDeleteOffer(null);
      toast.success('Offer deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete offer: ' + error.message);
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

  const handleEditClick = (offer: OfferData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOffer(offer);
  };

  const handleDeleteClick = (offer: OfferData, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteOffer(offer);
  };

  const canEdit = (status: string | null) => {
    // Allow editing for all statuses except accepted
    return !status || !['accepted'].includes(status);
  };

  const canDelete = (status: string | null) => {
    // Allow deleting draft and sent offers (admin tool flexibility)
    return !status || ['draft', 'sent'].includes(status);
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
    <>
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
                const offerCurrency = offer.currency || 'EUR';
                const offerConversionRate = offer.conversion_rate || 1;
                
                // Use stored total_monthly_estimate if available (already includes discount)
                const displayMonthly = offer.total_monthly_estimate || (() => {
                  const monthlyRevenue = (offer.annual_revenue || 0) / 12;
                  const revenueCost = monthlyRevenue * ((offer.revenue_percentage || 0) / 100);
                  return (offer.fixed_monthly || 0) + revenueCost;
                })();

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
                        displayMonthly, 
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
                      <div className="flex items-center justify-end gap-1">
                        {canEdit(offer.status) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => handleEditClick(offer, e)}
                            title="Edit offer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete(offer.status) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => handleDeleteClick(offer, e)}
                            title="Delete offer"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOffer(offer.offer_token);
                          }}
                          title="View offer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal with full create-offer parity */}
      <OfferEditModal 
        offer={editingOffer} 
        onClose={() => setEditingOffer(null)} 
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteOffer} onOpenChange={(open) => !open && setDeleteOffer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the offer for {deleteOffer?.customer_company}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOffer && deleteMutation.mutate(deleteOffer.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
