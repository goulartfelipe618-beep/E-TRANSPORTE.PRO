import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Treat empty strings, null, undefined as null
const clean = (v: unknown) => (v === "" || v === undefined || v === null ? null : v);
// Clean + parse as integer or null
const cleanInt = (v: unknown) => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
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
    console.log("Webhook received payload:", JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tipo = body.tipo_viagem;
    const ida = body.ida ?? {};
    const volta = body.volta ?? {};
    const porHora = body.por_hora ?? {};

    const record: Record<string, unknown> = {
      tipo_viagem: tipo,
      cliente_nome: clean(body.cliente_nome ?? body.clientName ?? body.name),
      cliente_telefone: clean(body.cliente_telefone ?? body.clientPhone ?? body.phone),
      cliente_email: clean(body.cliente_email ?? body.clientEmail ?? body.email),
      cliente_origem: clean(body.cliente_origem ?? body.source ?? body.origin ?? body.howDidYouFindUs),
      status: "pendente",
    };

    if (tipo === "somente_ida" || tipo === "ida_e_volta") {
      record.ida_passageiros = cleanInt(body.ida_passageiros ?? ida.passengers ?? body.passengers);
      record.ida_embarque = clean(body.ida_embarque ?? ida.pickupAddress ?? body.pickupAddress);
      const idaDateRaw = clean(body.ida_data ?? ida.date ?? body.date);
      record.ida_data = idaDateRaw ? String(idaDateRaw).substring(0, 10) : null;
      record.ida_hora = clean(body.ida_hora ?? ida.time ?? body.time);
      record.ida_destino = clean(body.ida_destino ?? ida.destination ?? body.destination);
      record.ida_mensagem = clean(body.ida_mensagem ?? ida.message ?? body.message);
      record.ida_cupom = clean(body.ida_cupom ?? ida.coupon ?? body.coupon);
    }

    if (tipo === "ida_e_volta") {
      record.volta_passageiros = cleanInt(body.volta_passageiros ?? volta.passengers ?? body.returnPassengers);
      record.volta_embarque = clean(body.volta_embarque ?? volta.pickupAddress ?? body.returnPickupAddress);
      const voltaDateRaw = clean(body.volta_data ?? volta.date ?? body.returnDate);
      record.volta_data = voltaDateRaw ? String(voltaDateRaw).substring(0, 10) : null;
      record.volta_hora = clean(body.volta_hora ?? volta.time ?? body.returnTime);
      record.volta_destino = clean(body.volta_destino ?? volta.destination ?? body.returnDestination);
      record.volta_mensagem = clean(body.volta_mensagem ?? volta.message ?? body.returnMessage);
      record.volta_cupom = clean(body.volta_cupom ?? volta.coupon ?? body.returnCoupon);
    }

    if (tipo === "por_hora") {
      record.por_hora_passageiros = cleanInt(body.por_hora_passageiros ?? porHora.passengers ?? body.passengers);
      record.por_hora_endereco_inicio = clean(body.por_hora_endereco_inicio ?? porHora.pickupAddress ?? body.pickupAddress);
      const phDateRaw = clean(body.por_hora_data ?? porHora.date ?? body.date);
      record.por_hora_data = phDateRaw ? String(phDateRaw).substring(0, 10) : null;
      record.por_hora_hora = clean(body.por_hora_hora ?? porHora.time ?? body.time);
      record.por_hora_qtd_horas = cleanInt(body.por_hora_qtd_horas ?? porHora.hours ?? body.hours);
      record.por_hora_ponto_encerramento = clean(body.por_hora_ponto_encerramento ?? porHora.endPoint ?? body.endPoint ?? porHora.dropoffAddress ?? body.dropoffAddress);
      record.por_hora_itinerario = clean(body.por_hora_itinerario ?? porHora.itinerary ?? body.itinerary ?? porHora.message ?? body.message);
      record.por_hora_cupom = clean(body.por_hora_cupom ?? porHora.coupon ?? body.coupon);
    }

    if (!record.tipo_viagem) {
      return new Response(
        JSON.stringify({ error: "tipo_viagem é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("solicitacoes_transfer")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
