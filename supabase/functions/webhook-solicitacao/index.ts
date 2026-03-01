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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Log the incoming payload for debugging
    console.log("Webhook received payload:", JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Map all fields from the external site form
    const record: Record<string, unknown> = {
      tipo_viagem: body.tipo_viagem, // 'somente_ida' | 'ida_e_volta' | 'por_hora'
      cliente_nome: body.cliente_nome ?? null,
      cliente_telefone: body.cliente_telefone ?? null,
      cliente_email: body.cliente_email ?? null,
      // Ida
      ida_passageiros: body.ida_passageiros ?? null,
      ida_embarque: body.ida_embarque ?? null,
      ida_data: body.ida_data ?? null,
      ida_hora: body.ida_hora ?? null,
      ida_destino: body.ida_destino ?? null,
      ida_mensagem: body.ida_mensagem ?? null,
      ida_cupom: body.ida_cupom ?? null,
      // Volta
      volta_passageiros: body.volta_passageiros ?? null,
      volta_embarque: body.volta_embarque ?? null,
      volta_data: body.volta_data ?? null,
      volta_hora: body.volta_hora ?? null,
      volta_destino: body.volta_destino ?? null,
      volta_mensagem: body.volta_mensagem ?? null,
      volta_cupom: body.volta_cupom ?? null,
      // Por Hora
      por_hora_passageiros: body.por_hora_passageiros ?? null,
      por_hora_endereco_inicio: body.por_hora_endereco_inicio ?? null,
      por_hora_data: body.por_hora_data ?? null,
      por_hora_hora: body.por_hora_hora ?? null,
      por_hora_qtd_horas: body.por_hora_qtd_horas ?? null,
      por_hora_ponto_encerramento: body.por_hora_ponto_encerramento ?? null,
      por_hora_itinerario: body.por_hora_itinerario ?? null,
      por_hora_cupom: body.por_hora_cupom ?? null,
      status: "pendente",
    };

    if (!record.tipo_viagem) {
      return new Response(
        JSON.stringify({ error: "tipo_viagem é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data, error } = await supabase
      .from("solicitacoes_transfer")
      .insert(record)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
