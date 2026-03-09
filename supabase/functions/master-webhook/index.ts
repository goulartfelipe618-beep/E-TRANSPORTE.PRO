import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Extract slug from path: /master-webhook/{slug}
    const pathParts = url.pathname.split("/");
    const slug = pathParts[pathParts.length - 1];

    if (!slug || slug === "master-webhook") {
      return new Response(JSON.stringify({ error: "Slug não fornecido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find webhook config by slug
    const { data: webhook, error: whError } = await supabase
      .from("master_webhooks")
      .select("*")
      .eq("webhook_slug", slug)
      .single();

    if (whError || !webhook) {
      return new Response(JSON.stringify({ error: "Webhook não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!webhook.recebimento_ativo) {
      return new Response(JSON.stringify({ error: "Webhook desativado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse incoming payload
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const logEntry = {
      webhook_id: webhook.id,
      categoria: webhook.categoria,
      payload,
      received_at: new Date().toISOString(),
    };

    console.log("Webhook received:", JSON.stringify(logEntry));

    // If outgoing webhook is enabled, forward data
    let forwardResult = null;
    if (webhook.envio_ativo && webhook.webhook_url_envio) {
      try {
        const fwdResponse = await fetch(webhook.webhook_url_envio, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoria: webhook.categoria,
            webhook_nome: webhook.nome,
            payload,
            timestamp: new Date().toISOString(),
          }),
        });
        forwardResult = {
          status: fwdResponse.status,
          success: fwdResponse.ok,
        };
      } catch (e) {
        forwardResult = { success: false, error: String(e) };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dados recebidos com sucesso",
        forwarded: forwardResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
