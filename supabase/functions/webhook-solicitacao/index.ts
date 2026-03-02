import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const clean = (v: unknown) => (v === "" || v === undefined || v === null ? null : v);
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

    const url = new URL(req.url);
    const automacaoId = url.searchParams.get("automacao_id");

    if (!automacaoId) {
      return new Response(
        JSON.stringify({ error: "Missing automacao_id query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: automacao, error: autoErr } = await supabase
      .from("automacoes")
      .select("*")
      .eq("id", automacaoId)
      .single();

    if (autoErr || !automacao) {
      return new Response(
        JSON.stringify({ error: "Automação não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If webhook is disabled, save as test
    if (!automacao.webhook_enabled) {
      const { count } = await supabase
        .from("webhook_tests")
        .select("*", { count: "exact", head: true })
        .eq("automacao_id", automacaoId);
      const label = `Teste ${(count ?? 0) + 1}`;

      const { data, error } = await supabase
        .from("webhook_tests")
        .insert({ label, payload: body, automacao_id: automacaoId })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ success: true, test: true, id: data.id, label }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Resolve helper ──
    const mapping: Record<string, string> | null = automacao.mapping && Object.keys(automacao.mapping).length > 0
      ? automacao.mapping
      : null;

    const resolve = (key: string) => {
      if (!mapping || !mapping[key]) return null;
      const varName = mapping[key];
      const parts = varName.split(".");
      let val: any = body;
      for (const p of parts) {
        if (val == null) return null;
        val = val[p];
      }
      return val;
    };

    // ── MOTORISTA flow ──
    if (automacao.tipo === "solicitacao_motorista") {
      const possuiVeiculoRaw = mapping ? resolve("possui_veiculo") : (body.possui_veiculo ?? body.hasVehicle);
      const possuiVeiculo = possuiVeiculoRaw === true || possuiVeiculoRaw === "true" || possuiVeiculoRaw === "sim" || possuiVeiculoRaw === "Sim" || possuiVeiculoRaw === 1;

      const record: Record<string, unknown> = {
        nome_completo: clean(mapping ? resolve("nome_completo") : (body.nome_completo ?? body.name ?? body.nome)) || "Sem nome",
        cpf: clean(mapping ? resolve("cpf") : (body.cpf ?? body.document)),
        telefone: clean(mapping ? resolve("telefone") : (body.telefone ?? body.phone)),
        email: clean(mapping ? resolve("email") : (body.email)),
        cidade: clean(mapping ? resolve("cidade") : (body.cidade ?? body.city)),
        estado: clean(mapping ? resolve("estado") : (body.estado ?? body.state)),
        cnh_numero: clean(mapping ? resolve("cnh_numero") : (body.cnh_numero ?? body.cnh)),
        cnh_categoria: clean(mapping ? resolve("cnh_categoria") : (body.cnh_categoria ?? body.cnhCategory)),
        possui_veiculo: possuiVeiculo,
        veiculo_marca: clean(mapping ? resolve("veiculo_marca") : (body.veiculo_marca ?? body.vehicleBrand)),
        veiculo_modelo: clean(mapping ? resolve("veiculo_modelo") : (body.veiculo_modelo ?? body.vehicleModel)),
        veiculo_ano: clean(mapping ? resolve("veiculo_ano") : (body.veiculo_ano ?? body.vehicleYear)),
        veiculo_placa: clean(mapping ? resolve("veiculo_placa") : (body.veiculo_placa ?? body.vehiclePlate)),
        experiencia: clean(mapping ? resolve("experiencia") : (body.experiencia ?? body.experience)),
        mensagem: clean(mapping ? resolve("mensagem") : (body.mensagem ?? body.message)),
        status: "pendente",
      };

      const { data, error } = await supabase
        .from("solicitacoes_motorista")
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
    }

    // ── TRANSFER flow (existing) ──
    const tipoFromMapping = mapping ? resolve("tipo_viagem") : null;
    const tipo = clean(tipoFromMapping ?? body.tipo_viagem) as string;

    const record: Record<string, unknown> = {
      tipo_viagem: tipo,
      cliente_nome: clean(mapping ? resolve("cliente_nome") : (body.cliente_nome ?? body.clientName ?? body.name)),
      cliente_telefone: clean(mapping ? resolve("cliente_telefone") : (body.cliente_telefone ?? body.clientPhone ?? body.phone)),
      cliente_email: clean(mapping ? resolve("cliente_email") : (body.cliente_email ?? body.clientEmail ?? body.email)),
      cliente_origem: clean(mapping ? resolve("cliente_origem") : (body.cliente_origem ?? body.source ?? body.origin ?? body.howDidYouFindUs)),
      automacao_id: automacaoId,
      status: "pendente",
    };

    if (mapping) {
      const idaFields = ["ida_passageiros", "ida_embarque", "ida_data", "ida_hora", "ida_destino", "ida_mensagem", "ida_cupom"];
      const voltaFields = ["volta_passageiros", "volta_embarque", "volta_data", "volta_hora", "volta_destino", "volta_mensagem"];
      const phFields = ["por_hora_passageiros", "por_hora_endereco_inicio", "por_hora_data", "por_hora_hora", "por_hora_qtd_horas", "por_hora_ponto_encerramento", "por_hora_itinerario", "por_hora_cupom"];
      const intFields = ["ida_passageiros", "volta_passageiros", "por_hora_passageiros", "por_hora_qtd_horas"];
      const dateFields = ["ida_data", "volta_data", "por_hora_data"];

      const allFields = [...idaFields, ...voltaFields, ...phFields];
      for (const f of allFields) {
        const val = resolve(f);
        if (intFields.includes(f)) {
          record[f] = cleanInt(val);
        } else if (dateFields.includes(f)) {
          record[f] = val ? String(val).substring(0, 10) : null;
        } else {
          record[f] = clean(val);
        }
      }
    } else {
      const ida = body.ida ?? {};
      const volta = body.volta ?? {};
      const porHora = body.por_hora ?? {};

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
    }

    if (!record.tipo_viagem) {
      record.tipo_viagem = "somente_ida";
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
