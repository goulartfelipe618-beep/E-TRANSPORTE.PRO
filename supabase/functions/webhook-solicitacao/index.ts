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

async function parseRequest(req: Request, supabase: any, storageFolder: string): Promise<Record<string, unknown>> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) return await req.json();

  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const result: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) result[key] = value;
    return result;
  }

  if (ct.includes("multipart/form-data")) {
    const formData = await req.formData();
    const result: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        result[key] = value;
      } else if (value instanceof File) {
        const file = value as File;
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${storageFolder}/${timestamp}_${safeName}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadErr } = await supabase.storage
          .from("webhook-uploads")
          .upload(path, arrayBuffer, { contentType: file.type || "application/octet-stream", upsert: false });
        if (uploadErr) {
          result[key] = `[upload_error: ${uploadErr.message}]`;
        } else {
          const { data: urlData } = supabase.storage.from("webhook-uploads").getPublicUrl(path);
          result[key] = urlData.publicUrl;
          result[`${key}__filename`] = file.name;
          result[`${key}__type`] = file.type;
          result[`${key}__size`] = file.size;
        }
      }
    }
    return result;
  }

  try { return await req.json(); } catch {
    const text = await req.text();
    try {
      const params = new URLSearchParams(text);
      const result: Record<string, unknown> = {};
      for (const [key, value] of params.entries()) result[key] = value;
      if (Object.keys(result).length > 0) return result;
    } catch { /* ignore */ }
    return { _raw_body: text };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);

    // ══════════════════════════════════════════════
    // CAMPANHA LEAD FLOW (direct by campanha_id)
    // ══════════════════════════════════════════════
    const campanhaId = url.searchParams.get("campanha_id");
    if (campanhaId) {
      const { data: campanha, error: campErr } = await supabase.from("campanhas").select("*").eq("id", campanhaId).single();
      if (campErr || !campanha) {
        return new Response(JSON.stringify({ error: "Campanha não encontrada" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const body = await parseRequest(req, supabase, `campanha_${campanhaId}`);
      console.log("Campanha webhook payload keys:", Object.keys(body));

      const leadRecord = {
        campanha_id: campanhaId,
        nome: clean(body.name ?? body.nome ?? body.nome_completo ?? body.full_name) as string || "Sem nome",
        email: clean(body.email ?? body.e_mail),
        telefone: clean(body.phone ?? body.telefone ?? body.whatsapp ?? body.tel),
        observacoes: clean(body.notes ?? body.observacoes ?? body.message ?? body.mensagem),
        status: "novo",
        payload: body,
      };

      const { data, error } = await supabase.from("leads").insert(leadRecord).select().single();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══════════════════════════════════════════════
    // AUTOMAÇÃO FLOW (existing logic)
    // ══════════════════════════════════════════════
    const automacaoId = url.searchParams.get("automacao_id");
    if (!automacaoId) {
      return new Response(JSON.stringify({ error: "Missing automacao_id or campanha_id query parameter" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: automacao, error: autoErr } = await supabase.from("automacoes").select("*").eq("id", automacaoId).single();
    if (autoErr || !automacao) {
      return new Response(JSON.stringify({ error: "Automação não encontrada" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await parseRequest(req, supabase, automacaoId);
    console.log("Webhook received payload keys:", Object.keys(body));

    // If webhook disabled → save as test
    if (!automacao.webhook_enabled) {
      const { count } = await supabase.from("webhook_tests").select("*", { count: "exact", head: true }).eq("automacao_id", automacaoId);
      const label = `Teste ${(count ?? 0) + 1}`;
      const { data, error } = await supabase.from("webhook_tests").insert({ label, payload: body, automacao_id: automacaoId }).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, test: true, id: data.id, label }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Webhook enabled → process with mapping
    const mapping: Record<string, string> | null = automacao.mapping && Object.keys(automacao.mapping).length > 0 ? automacao.mapping : null;

    const resolve = (key: string) => {
      if (!mapping || !mapping[key]) return null;
      const varName = mapping[key];
      const parts = varName.split(".");
      let val: any = body;
      for (const p of parts) { if (val == null) return null; val = val[p]; }
      return val;
    };

    // ── LEADS CAMPANHA flow ──
    if (automacao.tipo.startsWith("leads_campanha:")) {
      const campId = automacao.tipo.split(":")[1];
      const leadRecord = {
        campanha_id: campId,
        nome: clean(mapping ? resolve("nome") : (body.name ?? body.nome ?? body.nome_completo)) as string || "Sem nome",
        email: clean(mapping ? resolve("email") : (body.email ?? body.e_mail)),
        telefone: clean(mapping ? resolve("telefone") : (body.phone ?? body.telefone ?? body.whatsapp)),
        observacoes: clean(mapping ? resolve("observacoes") : (body.notes ?? body.observacoes ?? body.message)),
        status: "novo",
        payload: body,
      };
      const { data, error } = await supabase.from("leads").insert(leadRecord).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
      const { data, error } = await supabase.from("solicitacoes_motorista").insert(record).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── TRANSFER flow ──
    const tipoFromMapping = mapping ? resolve("tipo_viagem") : null;
    const tipo = clean(tipoFromMapping ?? body.tipo_viagem) as string;
    const record: Record<string, unknown> = {
      tipo_viagem: tipo || "somente_ida",
      cliente_nome: clean(mapping ? resolve("cliente_nome") : (body.cliente_nome ?? body.clientName ?? body.name)),
      cliente_telefone: clean(mapping ? resolve("cliente_telefone") : (body.cliente_telefone ?? body.clientPhone ?? body.phone)),
      cliente_email: clean(mapping ? resolve("cliente_email") : (body.cliente_email ?? body.clientEmail ?? body.email)),
      cliente_origem: clean(mapping ? resolve("cliente_origem") : (body.cliente_origem ?? body.source ?? body.origin)),
      automacao_id: automacaoId,
      status: "pendente",
    };

    if (mapping) {
      const allFields = ["ida_passageiros","ida_embarque","ida_data","ida_hora","ida_destino","ida_mensagem","ida_cupom","volta_passageiros","volta_embarque","volta_data","volta_hora","volta_destino","volta_mensagem","por_hora_passageiros","por_hora_endereco_inicio","por_hora_data","por_hora_hora","por_hora_qtd_horas","por_hora_ponto_encerramento","por_hora_itinerario","por_hora_cupom"];
      const intFields = ["ida_passageiros","volta_passageiros","por_hora_passageiros","por_hora_qtd_horas"];
      const dateFields = ["ida_data","volta_data","por_hora_data"];
      for (const f of allFields) {
        const val = resolve(f);
        if (intFields.includes(f)) record[f] = cleanInt(val);
        else if (dateFields.includes(f)) record[f] = val ? String(val).substring(0, 10) : null;
        else record[f] = clean(val);
      }
    } else {
      const ida = body.ida ?? {};
      const volta = body.volta ?? {};
      const porHora = body.por_hora ?? {};
      if (tipo === "somente_ida" || tipo === "ida_e_volta") {
        record.ida_passageiros = cleanInt(body.ida_passageiros ?? (ida as any).passengers ?? body.passengers);
        record.ida_embarque = clean(body.ida_embarque ?? (ida as any).pickupAddress ?? body.pickupAddress);
        const idaDateRaw = clean(body.ida_data ?? (ida as any).date ?? body.date);
        record.ida_data = idaDateRaw ? String(idaDateRaw).substring(0, 10) : null;
        record.ida_hora = clean(body.ida_hora ?? (ida as any).time ?? body.time);
        record.ida_destino = clean(body.ida_destino ?? (ida as any).destination ?? body.destination);
        record.ida_mensagem = clean(body.ida_mensagem ?? (ida as any).message ?? body.message);
        record.ida_cupom = clean(body.ida_cupom ?? (ida as any).coupon ?? body.coupon);
      }
      if (tipo === "ida_e_volta") {
        record.volta_passageiros = cleanInt(body.volta_passageiros ?? (volta as any).passengers ?? body.returnPassengers);
        record.volta_embarque = clean(body.volta_embarque ?? (volta as any).pickupAddress ?? body.returnPickupAddress);
        const voltaDateRaw = clean(body.volta_data ?? (volta as any).date ?? body.returnDate);
        record.volta_data = voltaDateRaw ? String(voltaDateRaw).substring(0, 10) : null;
        record.volta_hora = clean(body.volta_hora ?? (volta as any).time ?? body.returnTime);
        record.volta_destino = clean(body.volta_destino ?? (volta as any).destination ?? body.returnDestination);
        record.volta_mensagem = clean(body.volta_mensagem ?? (volta as any).message ?? body.returnMessage);
      }
      if (tipo === "por_hora") {
        record.por_hora_passageiros = cleanInt(body.por_hora_passageiros ?? (porHora as any).passengers ?? body.passengers);
        record.por_hora_endereco_inicio = clean(body.por_hora_endereco_inicio ?? (porHora as any).pickupAddress ?? body.pickupAddress);
        const phDateRaw = clean(body.por_hora_data ?? (porHora as any).date ?? body.date);
        record.por_hora_data = phDateRaw ? String(phDateRaw).substring(0, 10) : null;
        record.por_hora_hora = clean(body.por_hora_hora ?? (porHora as any).time ?? body.time);
        record.por_hora_qtd_horas = cleanInt(body.por_hora_qtd_horas ?? (porHora as any).hours ?? body.hours);
        record.por_hora_ponto_encerramento = clean(body.por_hora_ponto_encerramento ?? (porHora as any).endPoint ?? body.endPoint);
        record.por_hora_itinerario = clean(body.por_hora_itinerario ?? (porHora as any).itinerary ?? body.itinerary);
        record.por_hora_cupom = clean(body.por_hora_cupom ?? (porHora as any).coupon ?? body.coupon);
      }
    }

    const { data, error } = await supabase.from("solicitacoes_transfer").insert(record).select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
