import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is master_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Check caller role
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check role
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "master_admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: master_admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "list") {
      const { user_ids } = body;
      if (!user_ids?.length) {
        return new Response(JSON.stringify({ users: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const users = [];
      for (const uid of user_ids) {
        const { data } = await adminClient.auth.admin.getUserById(uid);
        if (data?.user) users.push({ id: data.user.id, email: data.user.email });
      }
      return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create") {
      const { email, password, role, tenant_id } = body;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Insert role
      await adminClient.from("user_roles").insert({
        user_id: data.user.id,
        role: role || "admin",
        tenant_id: tenant_id || null,
      });
      // Create empty profile (setup_complete = false forces onboarding)
      await adminClient.from("profiles").insert({
        user_id: data.user.id,
        email: email.trim(),
        setup_complete: false,
      });
      return new Response(JSON.stringify({ user: { id: data.user.id, email } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: targetRole } = await adminClient.from("user_roles").select("role").eq("user_id", user_id).maybeSingle();
      if (targetRole?.role === "master_admin") {
        return new Response(JSON.stringify({ error: "Master Admin não pode ser excluído" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      await adminClient.auth.admin.deleteUser(user_id);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "suspend_tenant") {
      const { tenant_id, ativo } = body;
      if (!tenant_id) {
        return new Response(JSON.stringify({ error: "tenant_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Update tenant status
      await adminClient.from("tenants").update({ ativo: !!ativo }).eq("id", tenant_id);

      // If suspending (ativo=false), force logout all users of this tenant
      if (!ativo) {
        const { data: tenantUsers } = await adminClient
          .from("user_roles")
          .select("user_id, role")
          .eq("tenant_id", tenant_id);

        if (tenantUsers?.length) {
          for (const u of tenantUsers) {
            // Don't logout master admins
            if (u.role === "master_admin") continue;
            await adminClient.auth.admin.signOut(u.user_id);
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, ativo: !!ativo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("manage-users unhandled error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
