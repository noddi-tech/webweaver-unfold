const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    
    if (!slackWebhookUrl) {
      console.error('SLACK_WEBHOOK_URL not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Slack webhook not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const formData: ContactFormData = await req.json();
    
    // Validate required fields
    if (!formData.firstName || !formData.email || !formData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Slack message payload
    const slackMessage = {
      text: "New Contact Form Submission",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚀 New Contact Form Submission"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Name:*\n${formData.firstName} ${formData.lastName}`
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${formData.email}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Subject:*\n${formData.subject || 'No subject provided'}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n${formData.message}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Submitted on ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    // Send to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!slackResponse.ok) {
      console.error('Failed to send message to Slack:', slackResponse.status, slackResponse.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to send message to Slack' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully sent contact form to Slack');

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});