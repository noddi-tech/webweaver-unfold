import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSalesConfig } from "../_shared/sales-config.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfferUpdateRequest {
  offerId: string;
  changes?: string[];
}

// Currency locale mapping
const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'de-DE',
  NOK: 'nb-NO',
  SEK: 'sv-SE',
  USD: 'en-US',
  GBP: 'en-GB'
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  NOK: 'kr',
  SEK: 'kr',
  USD: '$',
  GBP: '£'
};

// Check domain verification
async function getFromAddress(apiKey: string): Promise<string> {
  const domainPriority = [
    'info.naviosolutions.com',
    'career.naviosolutions.com',
    'navio.no',
  ];

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      const domains = await res.json();
      
      for (const domain of domainPriority) {
        const isVerified = domains.data?.some(
          (d: { name: string; status: string }) => 
            d.name === domain && d.status === "verified"
        );
        
        if (isVerified) {
          console.log(`Using verified ${domain} domain`);
          return `Navio Sales <sales@${domain}>`;
        }
      }
    }
  } catch (e) {
    console.log("Domain check failed:", e);
  }

  return "Navio Sales <onboarding@resend.dev>";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { offerId, changes }: OfferUpdateRequest = await req.json();

    // Fetch the offer
    const { data: offer, error: offerError } = await supabase
      .from("pricing_offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (offerError || !offer) {
      throw new Error(`Offer not found: ${offerId}`);
    }

    // Only send updates for sent offers
    if (offer.status !== 'sent' && offer.status !== 'viewed') {
      console.log("Skipping notification - offer status:", offer.status);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "Offer not sent yet" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get sales configuration from database
    const salesConfig = await getSalesConfig(supabase);

    const customerEmail = offer.customer_email;
    const customerName = offer.customer_name;
    const customerCompany = offer.customer_company;
    const currency = offer.currency || 'EUR';
    const conversionRate = offer.conversion_rate || 1;
    const offerToken = offer.offer_token;
    const tier = offer.tier;

    const offerViewUrl = offerToken 
      ? `https://naviosolutions.com/offer/${offerToken}`
      : salesConfig.bookingUrl;

    // Format currency
    const locale = CURRENCY_LOCALES[currency] || 'en-US';
    const symbol = CURRENCY_SYMBOLS[currency] || '€';
    const formatCurrency = (amountEUR: number) => 
      new Intl.NumberFormat(locale, { style: 'currency', currency: currency, maximumFractionDigits: 0 })
        .format(amountEUR * conversionRate);

    const displayTotalMonthly = offer.total_monthly_estimate 
      ? offer.total_monthly_estimate * conversionRate 
      : (offer.fixed_monthly || 0) * conversionRate;

    const tierLabel = tier === 'launch' ? 'Launch' : 'Scale';
    const formattedValidUntil = offer.expires_at 
      ? new Date(offer.expires_at).toLocaleDateString('nb-NO', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Videre beskjed';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Offer Has Been Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 48px;">🔄</p>
              <h1 style="color: #ffffff; margin: 16px 0 0 0; font-size: 24px; font-weight: 700;">Your Offer Has Been Updated</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${customerName},
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                We've made some updates to your pricing proposal for <strong>${customerCompany}</strong>. Please review the updated offer to see the latest details.
              </p>
              
              <!-- Updated Summary -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Updated Offer Summary</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b;">Plan:</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                      <span style="color: #0f172a; font-weight: 600;">${tierLabel}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b;">Estimated Monthly Cost:</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                      <span style="color: #0f172a; font-weight: 600;">${formatCurrency(offer.total_monthly_estimate || 0)}</span>
                    </td>
                  </tr>
                  ${offer.discount_percentage > 0 ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #059669;">Discount:</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                      <span style="color: #059669; font-weight: 600;">${offer.discount_percentage}% off</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b;">Valid Until:</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                      <span style="color: #0f172a; font-weight: 600;">${formattedValidUntil}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${offerViewUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Updated Offer
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                Questions about the changes? Reply to this email or <a href="${salesConfig.bookingUrl}" style="color: #3b82f6; text-decoration: none;">book a call</a> with us.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
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

    // Get verified domain
    const fromAddress = await getFromAddress(resendApiKey);

    // Send email with dynamic reply-to
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [customerEmail],
      reply_to: salesConfig.salesEmail,
      subject: `Your Navio Offer Has Been Updated`,
      html: emailHtml,
    });

    console.log("Offer update email sent successfully:", emailResponse);

    const resendId = emailResponse.data?.id;

    // Log the email
    await supabase.from("email_logs").insert({
      email_type: "pricing_offer_update",
      related_id: offerId,
      to_email: customerEmail,
      to_name: customerName,
      from_address: fromAddress,
      subject: `Your Navio Offer Has Been Updated`,
      resend_id: resendId,
      status: "sent",
      metadata: {
        tier,
        changes: changes || [],
        company: customerCompany,
      },
    });

    // Send Slack notification with primary contact info
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackWebhookUrl) {
      const assignedText = salesConfig.primaryContactName 
        ? `Assigned to: ${salesConfig.primaryContactName}`
        : '';
      
      try {
        await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🔄 Offer updated for ${customerCompany}`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `🔄 *Offer updated* for *${customerCompany}*\nCustomer has been notified via email.`,
                },
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Contact:*\n${customerName}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*Monthly Cost:*\n${formatCurrency(offer.total_monthly_estimate || 0)}`,
                  },
                ],
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: assignedText ? `👤 ${assignedText}` : 'No primary contact assigned',
                  },
                ],
              },
            ],
          }),
        });
      } catch (slackError) {
        console.error("Error sending Slack notification:", slackError);
      }
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-offer-update function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
