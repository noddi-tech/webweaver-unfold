import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingLinkRequest {
  applicationId: string;
  interviewType: string;
  expiresInDays?: number;
  slotIds?: string[];
}

// Check domain verification - prioritize naviosolutions.com
async function getFromAddress(apiKey: string): Promise<string> {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      const domains = await res.json();
      
      // Check naviosolutions.com first
      const navioSolutionsVerified = domains.data?.some(
        (d: { name: string; status: string }) => 
          d.name === "naviosolutions.com" && d.status === "verified"
      );
      if (navioSolutionsVerified) {
        console.log("Using verified naviosolutions.com domain");
        return "Navio Careers <careers@naviosolutions.com>";
      }
      
      // Fallback to navio.no
      const navioVerified = domains.data?.some(
        (d: { name: string; status: string }) => 
          d.name === "navio.no" && d.status === "verified"
      );
      if (navioVerified) {
        console.log("Using verified navio.no domain");
        return "Navio Careers <careers@navio.no>";
      }
    }
  } catch (e) {
    console.log("Domain check failed:", e);
  }

  console.log("Using Resend test domain as fallback");
  return "Navio Careers <onboarding@resend.dev>";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { applicationId, interviewType, expiresInDays = 7, slotIds }: BookingLinkRequest = await req.json();

    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(`
        id, applicant_name, applicant_email,
        job_listings (title)
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Generate unique booking token
    const bookingToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Get available slots to link
    let slotsQuery = supabase
      .from("interview_slots")
      .select("id")
      .eq("is_available", true)
      .eq("interview_type", interviewType)
      .gte("start_time", new Date().toISOString());

    if (slotIds && slotIds.length > 0) {
      slotsQuery = slotsQuery.in("id", slotIds);
    }

    const { data: slots, error: slotsError } = await slotsQuery;

    if (slotsError) {
      throw new Error("Failed to fetch available slots");
    }

    if (!slots || slots.length === 0) {
      throw new Error("No available slots found for the specified interview type");
    }

    // Update slots with booking token
    const { error: updateError } = await supabase
      .from("interview_slots")
      .update({
        booking_token: bookingToken,
        booking_token_expires_at: expiresAt.toISOString(),
        booked_by_application_id: applicationId
      })
      .in("id", slots.map(s => s.id));

    if (updateError) {
      throw new Error("Failed to update slots with booking token");
    }

    // Generate booking URL - use naviosolutions.com
    const baseUrl = "https://naviosolutions.com";
    const bookingUrl = `${baseUrl}/book/${bookingToken}`;

    // Send email if Resend is configured
    if (resendApiKey) {
      const jobTitle = (application.job_listings as any)?.title || "the position";
      const fromAddress = await getFromAddress(resendApiKey);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📅 Schedule Your Interview</h1>
            </div>
            <div class="content">
              <p>Hi ${application.applicant_name},</p>
              <p>Great news! We'd like to schedule an interview with you for the <strong>${jobTitle}</strong> position.</p>
              <p>Please click the button below to choose a time that works best for you:</p>
              <p style="text-align: center;">
                <a href="${bookingUrl}" class="button">Schedule My Interview</a>
              </p>
              <p>This link will expire in ${expiresInDays} days.</p>
              <p>If you have any questions, please don't hesitate to reach out.</p>
              <p>Best regards,<br>The Navio Team</p>
            </div>
            <div class="footer">
              <p>If the button doesn't work, copy and paste this link: ${bookingUrl}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [application.applicant_email],
          subject: `Schedule Your Interview - ${jobTitle}`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email:", await emailResponse.text());
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingUrl,
        bookingToken,
        expiresAt: expiresAt.toISOString(),
        slotsLinked: slots.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
