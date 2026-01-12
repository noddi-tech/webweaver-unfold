import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find posts that are scheduled and past their publish date
    const now = new Date().toISOString();
    
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title, published_at")
      .eq("status", "scheduled")
      .lte("published_at", now);

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled posts: ${fetchError.message}`);
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No posts to publish",
          published: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update all scheduled posts to published
    const postIds = scheduledPosts.map((p) => p.id);
    
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ 
        status: "published",
        active: true 
      })
      .in("id", postIds);

    if (updateError) {
      throw new Error(`Failed to publish posts: ${updateError.message}`);
    }

    console.log(`Published ${postIds.length} scheduled posts:`, scheduledPosts.map(p => p.title));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Published ${postIds.length} post(s)`,
        published: postIds.length,
        posts: scheduledPosts.map(p => ({ id: p.id, title: p.title }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error publishing scheduled posts:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
