import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionRequest {
  offer_token: string;
  name: string;
  email: string;
  question: string;
}

interface SalesContactInfo {
  salesEmail: string;
  primaryContactName: string | null;
}

async function getSalesContactInfo(supabase: any): Promise<SalesContactInfo> {
  // Get sales email
  const { data: emailSetting } = await supabase
    .from('sales_contact_settings')
    .select('value')
    .eq('setting_key', 'sales_email')
    .single();

  // Get primary contact with employee details
  const { data: contactSetting } = await supabase
    .from('sales_contact_settings')
    .select('employee_id, employees(name)')
    .eq('setting_key', 'primary_contact')
    .single();

  return {
    salesEmail: emailSetting?.value || 'sales@info.naviosolutions.com',
    primaryContactName: contactSetting?.employees?.name || null,
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { offer_token, name, email, question }: QuestionRequest = await req.json();

    // Get the offer details
    const { data: offer, error: offerError } = await supabase
      .from("pricing_offers")
      .select("*")
      .eq("token", offer_token)
      .single();

    if (offerError || !offer) {
      throw new Error("Offer not found");
    }

    // Get sales contact info from database
    const salesContactInfo = await getSalesContactInfo(supabase);

    // Update the offer with last question timestamp
    await supabase
      .from("pricing_offers")
      .update({ last_question_at: new Date().toISOString() })
      .eq("id", offer.id);

    // Determine the best from address
    const fromAddress = await getFromAddress(resendApiKey);

    // Send email to sales team using dynamic email
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [salesContactInfo.salesEmail],
      replyTo: email,
      subject: `Question about pricing offer - ${offer.company_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">New Question About Pricing Offer</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">From:</h3>
            <p><strong>${name}</strong> (${email})</p>
            
            <h3>Company:</h3>
            <p>${offer.company_name}</p>
            
            <h3>Offer Details:</h3>
            <p>
              Tier: ${offer.tier}<br>
              Monthly Cost: ${offer.fixed_monthly_cost?.toLocaleString("nb-NO")} NOK + ${offer.revenue_percentage}% revenue<br>
              Locations: ${offer.locations_included}
            </p>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Question:</h3>
            <p style="white-space: pre-wrap;">${question}</p>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    console.log("Question email sent:", emailResponse.data?.id);

    // Log the email
    await supabase.from("email_logs").insert({
      email_type: "offer_question",
      related_id: offer.id,
      to_email: salesContactInfo.salesEmail,
      to_name: "Navio Sales",
      from_address: fromAddress,
      subject: `Question about pricing offer - ${offer.company_name}`,
      resend_id: emailResponse.data?.id,
      status: "sent",
      metadata: { question, from_name: name, from_email: email },
    });

    // Send Slack notification with primary contact info
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackWebhookUrl) {
      const assignedText = salesContactInfo.primaryContactName 
        ? `👤 Assigned to: ${salesContactInfo.primaryContactName}`
        : '';
      
      await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `❓ New question about pricing offer from ${offer.company_name}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `❓ *${name}* from *${offer.company_name}* has a question about their pricing offer`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `> ${question}`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `📧 Reply to: ${email}${assignedText ? ` | ${assignedText}` : ''}`,
                },
              ],
            },
          ],
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing question:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getFromAddress(apiKey: string): Promise<string> {
  const domainPriority = [
    "info.naviosolutions.com",
    "career.naviosolutions.com",
    "navio.no",
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
          return `Navio <hello@${domain}>`;
        }
      }
    }
  } catch (e) {
    console.log("Domain check failed:", e);
  }

  return "Navio <onboarding@resend.dev>";
}
