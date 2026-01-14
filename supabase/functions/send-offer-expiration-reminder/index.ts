import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Currency configuration
const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'de-DE', NOK: 'nb-NO', SEK: 'sv-SE', USD: 'en-US', GBP: 'en-GB'
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', NOK: 'kr', SEK: 'kr', USD: '$', GBP: '£'
};

// Check domain verification
async function getFromAddress(apiKey: string): Promise<string> {
  const domainPriority = ['info.naviosolutions.com', 'career.naviosolutions.com', 'navio.no'];

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      const domains = await res.json();
      for (const domain of domainPriority) {
        const isVerified = domains.data?.some(
          (d: { name: string; status: string }) => d.name === domain && d.status === "verified"
        );
        if (isVerified) return `Navio Sales <sales@${domain}>`;
      }
    }
  } catch (e) {
    console.log("Domain check failed:", e);
  }

  return "Navio Sales <onboarding@resend.dev>";
}

function getReminderType(daysUntilExpiry: number): { type: string; column: string; subject: string; urgency: string } | null {
  if (daysUntilExpiry <= 1 && daysUntilExpiry >= 0) {
    return { type: '1_day', column: 'reminder_1_sent_at', subject: 'Last Chance: Your Navio Offer Expires Tomorrow', urgency: '⚠️ Final Notice' };
  }
  if (daysUntilExpiry <= 3 && daysUntilExpiry > 1) {
    return { type: '3_day', column: 'reminder_3_sent_at', subject: 'Reminder: Your Navio Offer Expires in 3 Days', urgency: '⏰ Reminder' };
  }
  if (daysUntilExpiry <= 7 && daysUntilExpiry > 3) {
    return { type: '7_day', column: 'reminder_7_sent_at', subject: 'Your Navio Offer Expires in 1 Week', urgency: '📅 Heads Up' };
  }
  return null;
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

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch offers expiring within 7 days that haven't been accepted
    const { data: offers, error: fetchError } = await supabase
      .from("pricing_offers")
      .select("*")
      .in("status", ["sent", "viewed"])
      .is("accepted_at", null)
      .lte("expires_at", sevenDaysFromNow.toISOString())
      .gte("expires_at", now.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch offers: ${fetchError.message}`);
    }

    console.log(`Found ${offers?.length || 0} offers expiring soon`);

    const results: { offerId: string; reminderType: string; success: boolean; error?: string }[] = [];
    const fromAddress = await getFromAddress(resendApiKey);

    for (const offer of offers || []) {
      const expiresAt = new Date(offer.expires_at);
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const reminder = getReminderType(daysUntilExpiry);

      if (!reminder) continue;

      // Check if this reminder was already sent
      if (offer[reminder.column]) {
        console.log(`Reminder ${reminder.type} already sent for offer ${offer.id}`);
        continue;
      }

      const currency = offer.currency || 'EUR';
      const conversionRate = offer.conversion_rate || 1;
      const locale = CURRENCY_LOCALES[currency] || 'en-US';
      const formatCurrency = (amountEUR: number) => 
        new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 })
          .format(amountEUR * conversionRate);

      const offerViewUrl = offer.offer_token 
        ? `https://naviosolutions.com/offer/${offer.offer_token}`
        : "https://calendly.com/navio/demo";

      const tierLabel = offer.tier === 'launch' ? 'Launch' : 'Scale';
      const formattedExpiry = expiresAt.toLocaleDateString('nb-NO', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${reminder.type === '1_day' ? '#ef4444 0%, #dc2626' : '#f59e0b 0%, #d97706'} 100%); padding: 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 48px;">${reminder.type === '1_day' ? '⚠️' : '⏰'}</p>
              <h1 style="color: #ffffff; margin: 16px 0 0 0; font-size: 24px; font-weight: 700;">${reminder.urgency}</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0 0; font-size: 14px;">Your offer expires ${reminder.type === '1_day' ? 'tomorrow' : `in ${daysUntilExpiry} days`}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${offer.customer_name},
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Your custom pricing proposal for <strong>${offer.customer_company}</strong> is expiring on <strong>${formattedExpiry}</strong>. 
                ${reminder.type === '1_day' 
                  ? "This is your last chance to lock in this pricing." 
                  : "Don't miss out on this offer!"}
              </p>
              
              <!-- Offer Summary -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Offer</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;"><span style="color: #64748b;">Plan:</span></td>
                    <td style="text-align: right; padding: 8px 0;"><span style="color: #0f172a; font-weight: 600;">${tierLabel}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><span style="color: #64748b;">Monthly Cost:</span></td>
                    <td style="text-align: right; padding: 8px 0;"><span style="color: #0f172a; font-weight: 600;">${formatCurrency(offer.total_monthly_estimate || 0)}</span></td>
                  </tr>
                  ${offer.discount_percentage > 0 ? `
                  <tr>
                    <td style="padding: 8px 0;"><span style="color: #059669;">Discount:</span></td>
                    <td style="text-align: right; padding: 8px 0;"><span style="color: #059669; font-weight: 600;">${offer.discount_percentage}% off</span></td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${offerViewUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Accept Offer Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                Need more time or have questions? Reply to this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Navio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: fromAddress,
          to: [offer.customer_email],
          reply_to: "sales@info.naviosolutions.com",
          subject: reminder.subject,
          html: emailHtml,
        });

        console.log(`Sent ${reminder.type} reminder for offer ${offer.id}:`, emailResponse);

        // Mark reminder as sent
        await supabase
          .from("pricing_offers")
          .update({ [reminder.column]: new Date().toISOString() })
          .eq("id", offer.id);

        // Log email
        await supabase.from("email_logs").insert({
          email_type: `offer_expiration_${reminder.type}`,
          related_id: offer.id,
          to_email: offer.customer_email,
          to_name: offer.customer_name,
          from_address: fromAddress,
          subject: reminder.subject,
          resend_id: emailResponse.data?.id,
          status: "sent",
          metadata: { reminder_type: reminder.type, days_until_expiry: daysUntilExpiry },
        });

        results.push({ offerId: offer.id, reminderType: reminder.type, success: true });
      } catch (emailError: any) {
        console.error(`Failed to send reminder for offer ${offer.id}:`, emailError);
        results.push({ offerId: offer.id, reminderType: reminder.type, success: false, error: emailError.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-offer-expiration-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
