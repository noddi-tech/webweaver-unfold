import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfferEmailRequest {
  offerId: string;
  customerEmail: string;
  customerName: string;
  customerCompany: string;
  tier: string;
  fixedMonthly: number;
  revenuePercentage: number;
  discountPercentage: number;
  estimatedAnnualRevenue: number;
  locations: number;
  validUntil: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: OfferEmailRequest = await req.json();
    
    const {
      offerId,
      customerEmail,
      customerName,
      customerCompany,
      tier,
      fixedMonthly,
      revenuePercentage,
      discountPercentage,
      estimatedAnnualRevenue,
      locations,
      validUntil,
      notes
    } = data;

    // Calculate costs
    const monthlyRevenue = estimatedAnnualRevenue / 12;
    const revenueCost = monthlyRevenue * (revenuePercentage / 100);
    const totalMonthly = fixedMonthly + revenueCost;
    const effectiveRate = ((totalMonthly / monthlyRevenue) * 100).toFixed(2);

    // Format currency
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(amount);

    const tierLabel = tier === 'launch' ? 'Launch' : 'Scale';
    const formattedValidUntil = new Date(validUntil).toLocaleDateString('nb-NO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing Offer from Navio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Navio</h1>
              <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Pricing Proposal</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${customerName},
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Thank you for your interest in Navio. Based on our conversation, we've prepared a custom pricing proposal for <strong>${customerCompany}</strong>.
              </p>
              
              <!-- Tier Badge -->
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #ffffff; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Plan</p>
                <h2 style="color: #ffffff; margin: 8px 0 0 0; font-size: 32px; font-weight: 700;">${tierLabel}</h2>
                ${locations > 1 ? `<p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">${locations} locations</p>` : ''}
              </div>
              
              <!-- Pricing Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-radius: 8px 8px 0 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Fixed Monthly Fee</span>
                    <span style="color: #0f172a; font-size: 18px; font-weight: 600; float: right;">${formatCurrency(fixedMonthly)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Revenue Share</span>
                    <span style="color: #0f172a; font-size: 18px; font-weight: 600; float: right;">${revenuePercentage.toFixed(1)}%</span>
                  </td>
                </tr>
                ${discountPercentage > 0 ? `
                <tr>
                  <td style="padding: 16px; background-color: #ecfdf5; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #059669; font-size: 14px;">🎉 Discount Applied</span>
                    <span style="color: #059669; font-size: 18px; font-weight: 600; float: right;">-${discountPercentage}%</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
                    <span style="color: #64748b; font-size: 14px;">Effective Rate</span>
                    <span style="color: #3b82f6; font-size: 18px; font-weight: 600; float: right;">${effectiveRate}%</span>
                  </td>
                </tr>
              </table>
              
              <!-- Estimated Cost -->
              <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: #94a3b8; margin: 0; font-size: 14px;">Estimated Monthly Cost</p>
                <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 36px; font-weight: 700;">${formatCurrency(totalMonthly)}</p>
                <p style="color: #64748b; margin: 8px 0 0 0; font-size: 12px;">Based on ${formatCurrency(estimatedAnnualRevenue)} annual revenue</p>
              </div>
              
              ${notes ? `
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">Note from our team:</p>
                <p style="color: #78350f; margin: 8px 0 0 0; font-size: 14px; line-height: 1.5;">${notes}</p>
              </div>
              ` : ''}
              
              <!-- Validity -->
              <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0 0 32px 0;">
                This offer is valid until <strong>${formattedValidUntil}</strong>
              </p>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://calendly.com/navio/demo" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Schedule a Call
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                Questions? Reply to this email or reach us at hello@navio.no
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 12px 0 0 0;">
                © ${new Date().getFullYear()} Navio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Navio Sales <sales@navio.no>",
      to: [customerEmail],
      subject: `Your Pricing Proposal from Navio - ${tierLabel} Plan`,
      html: emailHtml,
    });

    console.log("Offer email sent successfully:", emailResponse);

    // Update offer status in database
    const { error: updateError } = await supabase
      .from('pricing_offers')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', offerId);

    if (updateError) {
      console.error("Error updating offer status:", updateError);
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-pricing-offer function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
