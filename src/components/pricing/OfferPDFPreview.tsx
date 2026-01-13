import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Loader2, FileText, Calendar, Building2, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface OfferData {
  customerName: string;
  customerEmail: string;
  companyName: string;
  tier: 'launch' | 'scale';
  fixedMonthly: number;
  revenuePercentage: number;
  discountPercentage: number;
  totalMonthly: number;
  totalYearly: number;
  validUntil: Date;
  notes: string;
  annualRevenue: number;
  locations: number;
}

interface OfferPDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: OfferData;
}

export function OfferPDFPreview({ open, onOpenChange, offer }: OfferPDFPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamically import jsPDF and html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      // Get the preview element
      const previewElement = document.getElementById('offer-preview-content');
      if (!previewElement) {
        throw new Error('Preview element not found');
      }

      // Create canvas from the preview
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download
      const fileName = `Navio_Offer_${offer.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Offer Preview
            </DialogTitle>
            <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* PDF Preview Content */}
        <div 
          id="offer-preview-content" 
          className="bg-white text-black p-8 rounded-lg border"
          style={{ minHeight: '800px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Navio</h1>
              <p className="text-sm text-gray-500">Smart Booking Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pricing Offer</p>
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Customer Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Prepared For
            </h2>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{offer.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{offer.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{offer.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Valid until: {offer.validUntil.toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* Pricing Tier */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Selected Plan</h2>
            <div className={`p-6 rounded-lg border-2 ${offer.tier === 'launch' ? 'border-emerald-500 bg-emerald-50' : 'border-blue-500 bg-blue-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge className={offer.tier === 'launch' ? 'bg-emerald-500' : 'bg-blue-500'}>
                    {offer.tier === 'launch' ? 'Launch' : 'Scale'}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {offer.tier === 'launch' 
                      ? 'Perfect for single-location businesses'
                      : `Multi-location enterprise solution (${offer.locations} locations)`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Pricing Breakdown</h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 font-medium">Fixed Monthly Fee</td>
                    <td className="p-4 text-right">{formatCurrency(offer.fixedMonthly)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 font-medium">Revenue Share Rate</td>
                    <td className="p-4 text-right">{offer.revenuePercentage.toFixed(2)}%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 font-medium">Estimated Annual Revenue</td>
                    <td className="p-4 text-right">{formatCurrency(offer.annualRevenue)}</td>
                  </tr>
                  {offer.discountPercentage > 0 && (
                    <tr className="border-b border-gray-200 bg-green-50">
                      <td className="p-4 font-medium text-green-700">Yearly Discount</td>
                      <td className="p-4 text-right text-green-700 font-semibold">-{offer.discountPercentage}%</td>
                    </tr>
                  )}
                  <tr className="bg-blue-600 text-white">
                    <td className="p-4 font-semibold">Estimated Monthly Total</td>
                    <td className="p-4 text-right font-bold text-lg">{formatCurrency(offer.totalMonthly)}</td>
                  </tr>
                  <tr className="bg-blue-700 text-white">
                    <td className="p-4 font-semibold">Estimated Yearly Total</td>
                    <td className="p-4 text-right font-bold text-xl">{formatCurrency(offer.totalYearly)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {offer.notes && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{offer.notes}</p>
              </div>
            </div>
          )}

          {/* What's Included */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">What's Included</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm">Full booking platform access</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm">Customer management tools</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm">Analytics & reporting</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm">SMS & email notifications</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm">Dedicated support</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm">White-label customization</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <Separator className="my-8" />
          <div className="text-center text-sm text-gray-500">
            <p>This offer is valid until {offer.validUntil.toLocaleDateString('en-GB')}</p>
            <p className="mt-2">Questions? Contact us at sales@navio.no</p>
            <p className="mt-4 font-medium text-blue-600">www.navio.no</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
