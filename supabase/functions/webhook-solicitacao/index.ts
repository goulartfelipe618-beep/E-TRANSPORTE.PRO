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

    // Map fields from the external site form (accepts both Portuguese DB names and English site names)
    const tipo = body.tipo_viagem;

    const record: Record<string, unknown> = {
      tipo_viagem: tipo,
      cliente_nome: body.cliente_nome ?? body.clientName ?? body.name ?? null,
      cliente_telefone: body.cliente_telefone ?? body.clientPhone ?? body.phone ?? null,
      cliente_email: body.cliente_email ?? body.clientEmail ?? body.email ?? null,
      cliente_origem: body.cliente_origem ?? body.source ?? body.origin ?? body.howDidYouFindUs ?? null,
      status: "pendente",
    };

    // Map fields based on trip type, accepting both PT-BR db names and EN site names
    if (tipo === "somente_ida" || tipo === "ida_e_volta") {
      record.ida_passageiros = body.ida_passageiros ?? body.passengers ?? null;
      record.ida_embarque = body.ida_embarque ?? body.pickupAddress ?? null;
      record.ida_data = body.ida_data ?? (body.date ? body.date.substring(0, 10) : null);
      record.ida_hora = body.ida_hora ?? body.time ?? null;
      record.ida_destino = body.ida_destino ?? body.destination ?? null;
      record.ida_mensagem = body.ida_mensagem ?? body.message ?? null;
      record.ida_cupom = body.ida_cupom ?? body.coupon ?? null;
    }

    if (tipo === "ida_e_volta") {
      record.volta_passageiros = body.volta_passageiros ?? body.returnPassengers ?? body.passengers ?? null;
      record.volta_embarque = body.volta_embarque ?? body.returnPickupAddress ?? null;
      record.volta_data = body.volta_data ?? (body.returnDate ? body.returnDate.substring(0, 10) : null);
      record.volta_hora = body.volta_hora ?? body.returnTime ?? null;
      record.volta_destino = body.volta_destino ?? body.returnDestination ?? null;
      record.volta_mensagem = body.volta_mensagem ?? body.returnMessage ?? null;
      record.volta_cupom = body.volta_cupom ?? body.returnCoupon ?? null;
    }

    if (tipo === "por_hora") {
      record.por_hora_passageiros = body.por_hora_passageiros ?? body.passengers ?? null;
      record.por_hora_endereco_inicio = body.por_hora_endereco_inicio ?? body.pickupAddress ?? null;
      record.por_hora_data = body.por_hora_data ?? (body.date ? body.date.substring(0, 10) : null);
      record.por_hora_hora = body.por_hora_hora ?? body.time ?? null;
      record.por_hora_qtd_horas = body.por_hora_qtd_horas ?? body.hours ?? null;
      record.por_hora_ponto_encerramento = body.por_hora_ponto_encerramento ?? body.endPoint ?? null;
      record.por_hora_itinerario = body.por_hora_itinerario ?? body.itinerary ?? null;
      record.por_hora_cupom = body.por_hora_cupom ?? body.coupon ?? null;
    }

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
