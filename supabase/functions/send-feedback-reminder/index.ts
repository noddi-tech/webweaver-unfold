import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  interview_id?: string;
  interviewer_email?: string;
  interviewer_name?: string;
  process_pending?: boolean; // Process all pending reminders
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { interview_id, interviewer_email, interviewer_name, process_pending }: ReminderRequest = await req.json();

    // Get email template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", "feedback_reminder")
      .eq("is_active", true)
      .single();

    if (!template) {
      throw new Error("Feedback reminder email template not found or inactive");
    }

    let remindersToSend: any[] = [];

    if (process_pending) {
      // Get all pending reminders that are due
      const { data: pendingReminders, error: fetchError } = await supabase
        .from("interview_reminders")
        .select(`
          *,
          interviews!inner(
            id,
            title,
            interview_type,
            scheduled_at,
            status,
            application_id,
            job_applications!inner(
              id,
              applicant_name,
              job_id,
              job_listings!inner(title)
            )
          )
        `)
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString());

      if (fetchError) throw fetchError;
      remindersToSend = pendingReminders || [];
    } else if (interview_id) {
      // Send reminder for specific interview
      const { data: interview, error: interviewError } = await supabase
        .from("interviews")
        .select(`
          id,
          title,
          interview_type,
          scheduled_at,
          status,
          interviewer_names,
          interviewer_ids,
          application_id,
          job_applications!inner(
            id,
            applicant_name,
            job_id,
            job_listings!inner(title)
          )
        `)
        .eq("id", interview_id)
        .single();

      if (interviewError) throw interviewError;

      // Create ad-hoc reminder entries
      if (interviewer_email) {
        remindersToSend = [{
          interviewer_email,
          interviewer_name: interviewer_name || "Team Member",
          interviews: interview,
        }];
      } else if (interview.interviewer_names && interview.interviewer_names.length > 0) {
        // Note: We don't have interviewer emails stored, so this is a placeholder
        // In real implementation, you'd need to store interviewer emails or look them up
        remindersToSend = interview.interviewer_names.map((name: string, index: number) => ({
          interviewer_email: null, // Would need to be fetched from user profiles
          interviewer_name: name,
          interviews: interview,
        }));
      }
    }

    const sentReminders: string[] = [];
    const failedReminders: { email: string; error: string }[] = [];

    for (const reminder of remindersToSend) {
      const interview = reminder.interviews;
      const application = interview.job_applications;
      const candidateName = application.applicant_name;
      const jobTitle = application.job_listings.title;
      const interviewDate = new Date(interview.scheduled_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Skip if no email
      if (!reminder.interviewer_email) {
        console.log(`Skipping reminder for ${reminder.interviewer_name} - no email address`);
        continue;
      }

      // Build email content from template
      const subject = template.subject
        .replace(/\{\{candidate_name\}\}/g, candidateName);

      const evaluationUrl = `https://navio.no/cms?tab=applications&application=${application.id}`;

      let bodyHtml = template.body_html
        .replace(/\{\{interviewer_name\}\}/g, reminder.interviewer_name || "Team Member")
        .replace(/\{\{candidate_name\}\}/g, candidateName)
        .replace(/\{\{job_title\}\}/g, jobTitle)
        .replace(/\{\{interview_date\}\}/g, interviewDate)
        .replace(/\{\{interview_type\}\}/g, interview.interview_type || "Interview");

      const buttonUrl = (template.button_url || evaluationUrl)
        .replace(/\{\{evaluation_url\}\}/g, evaluationUrl);

      // Build full HTML email
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, ${template.header_bg_start || '#6366f1'}, ${template.header_bg_end || '#8b5cf6'}); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${template.emoji || '📝'}</div>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${template.heading}</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              ${bodyHtml}
              ${template.button_text ? `
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${template.header_bg_start || '#6366f1'}, ${template.header_bg_end || '#8b5cf6'}); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${template.button_text}</a>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "Navio Careers <careers@navio.no>",
          to: [reminder.interviewer_email],
          subject: subject,
          html: fullHtml,
        });

        console.log("Feedback reminder sent:", emailResponse);
        sentReminders.push(reminder.interviewer_email);

        // Update reminder status if it has an ID
        if (reminder.id) {
          await supabase
            .from("interview_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);
        }
      } catch (emailError: any) {
        console.error(`Failed to send reminder to ${reminder.interviewer_email}:`, emailError);
        failedReminders.push({ email: reminder.interviewer_email, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentReminders.length,
        failed: failedReminders.length,
        sentTo: sentReminders,
        failures: failedReminders,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-feedback-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
