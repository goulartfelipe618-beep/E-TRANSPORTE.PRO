import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Cleanup old attempts periodically
    await supabase.rpc("cleanup_old_login_attempts");

    const normalizedEmail = email.trim().toLowerCase();

    if (action === "check") {
      // Check how many failed attempts in the window
      const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

      const { count } = await supabase
        .from("login_attempts")
        .select("*", { count: "exact", head: true })
        .eq("email", normalizedEmail)
        .eq("success", false)
        .gte("attempted_at", windowStart);

      const remaining = Math.max(0, MAX_ATTEMPTS - (count || 0));
      const blocked = remaining === 0;

      return new Response(
        JSON.stringify({ blocked, remaining, window_minutes: WINDOW_MINUTES }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "record") {
      const { success } = await req.json().catch(() => ({ success: false }));

      // If login succeeded, clear previous failed attempts
      if (success) {
        await supabase
          .from("login_attempts")
          .delete()
          .eq("email", normalizedEmail);
      }

      await supabase.from("login_attempts").insert({
        email: normalizedEmail,
        success: !!loginSuccess,
      });

      return new Response(
        JSON.stringify({ recorded: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
