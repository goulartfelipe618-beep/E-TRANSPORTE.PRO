import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, latitude, longitude } = await req.json();

    if (!token || typeof token !== "string" || token.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "get") {
      const { data, error } = await supabase
        .from("tracking_links")
        .select("id, token, status, expires_at, cliente_nome, embarque_endereco, reserva_id, reserva_grupo_id")
        .eq("token", token)
        .maybeSingle();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Invalid link" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Link expired" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Try to get embarque coordinates from linked reservation
      let embarque_lat: number | null = null;
      let embarque_lng: number | null = null;
      let embarque_endereco = data.embarque_endereco || null;

      if (data.reserva_id) {
        const { data: reserva } = await supabase
          .from("reservas_transfer")
          .select("ida_embarque, ida_embarque_lat, ida_embarque_lng, por_hora_endereco_inicio, tipo_viagem")
          .eq("id", data.reserva_id)
          .maybeSingle();
        if (reserva) {
          embarque_lat = reserva.ida_embarque_lat;
          embarque_lng = reserva.ida_embarque_lng;
          if (!embarque_endereco) {
            embarque_endereco = reserva.tipo_viagem === "por_hora"
              ? reserva.por_hora_endereco_inicio
              : reserva.ida_embarque;
          }
        }
      } else if (data.reserva_grupo_id) {
        const { data: reserva } = await supabase
          .from("reservas_grupos")
          .select("endereco_embarque, embarque_lat, embarque_lng")
          .eq("id", data.reserva_grupo_id)
          .maybeSingle();
        if (reserva) {
          embarque_lat = reserva.embarque_lat;
          embarque_lng = reserva.embarque_lng;
          if (!embarque_endereco) {
            embarque_endereco = reserva.endereco_embarque;
          }
        }
      }

      return new Response(JSON.stringify({
        valid: true,
        status: data.status,
        cliente_nome: data.cliente_nome,
        embarque_endereco,
        embarque_lat,
        embarque_lng,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_location") {
      if (typeof latitude !== "number" || typeof longitude !== "number" ||
          latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return new Response(JSON.stringify({ error: "Invalid coordinates" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: link } = await supabase
        .from("tracking_links")
        .select("id, expires_at, status")
        .eq("token", token)
        .maybeSingle();

      if (!link) {
        return new Response(JSON.stringify({ error: "Invalid link" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (link.status === "expirado" || (link.expires_at && new Date(link.expires_at) < new Date())) {
        return new Response(JSON.stringify({ error: "Link expired" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("tracking_links")
        .update({
          latitude,
          longitude,
          last_location_at: new Date().toISOString(),
          status: "ativo",
        })
        .eq("id", link.id);

      if (error) {
        return new Response(JSON.stringify({ error: "Update failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ updated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
