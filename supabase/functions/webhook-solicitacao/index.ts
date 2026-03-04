import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

const sanitize = (v: unknown): unknown => {
  if (typeof v === "string") return v.replace(/[<>]/g, (c) => c === "<" ? "&lt;" : "&gt;").substring(0, 5000);
  if (Array.isArray(v)) return v.map(sanitize);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k.substring(0, 100)] = sanitize(val);
    return out;
  }
  return v;
};

const cleanStr = (v: unknown, maxLen = 500): string | null => {
  const raw = clean(v);
  if (raw === null) return null;
  return String(raw).replace(/[<>]/g, (c) => c === "<" ? "&lt;" : "&gt;").substring(0, maxLen);
};

const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

// --- Schemas ---
const leadSchema = z.object({
  nome: z.string().max(300).optional(),
  email: z.string().max(255).optional(),
  telefone: z.string().max(30).optional(),
  observacoes: z.string().max(2000).optional(),
}).passthrough();

const motoristaSchema = z.object({
  nome_completo: z.string().max(300).optional(),
  cpf: z.string().max(20).optional(),
  telefone: z.string().max(30).optional(),
  email: z.string().max(255).optional(),
}).passthrough();

const transferSchema = z.object({
  tipo_viagem: z.string().max(50).optional(),
  cliente_nome: z.string().max(300).optional(),
  cliente_telefone: z.string().max(30).optional(),
  cliente_email: z.string().max(255).optional(),
}).passthrough();

async function parseRequest(req: Request, supabase: any, storageFolder: string): Promise<Record<string, unknown>> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) {
    const body = await req.json();
    return sanitize(body) as Record<string, unknown>;
  }

  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const result: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) result[key.substring(0, 100)] = sanitize(value);
    return result;
  }

  if (ct.includes("multipart/form-data")) {
    const formData = await req.formData();
    const result: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        result[key.substring(0, 100)] = sanitize(value);
      } else if (value instanceof File) {
        const file = value as File;
        if (file.size > MAX_FILE_SIZE) {
          result[key] = `[file_too_large: ${file.size} bytes]`;
          continue;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          result[key] = `[invalid_file_type: ${file.type}]`;
          continue;
        }
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);
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

  try {
    const body = await req.json();
    return sanitize(body) as Record<string, unknown>;
  } catch {
    const text = await req.text();
    try {
      const params = new URLSearchParams(text);
      const result: Record<string, unknown> = {};
      for (const [key, value] of params.entries()) result[key.substring(0, 100)] = sanitize(value);
      if (Object.keys(result).length > 0) return result;
    } catch { /* ignore */ }
    return { _raw_body: String(text).substring(0, 5000) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  // Payload size check
  const contentLength = parseInt(req.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);

    // ══════════════════════════════════════════════
    // CAMPANHA LEAD FLOW (direct by campanha_id)
    // ══════════════════════════════════════════════
    const campanhaId = url.searchParams.get("campanha_id");
    if (campanhaId) {
      if (!/^[0-9a-f-]{36}$/i.test(campanhaId)) {
        return new Response(JSON.stringify({ error: "Invalid campanha_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: campanha, error: campErr } = await supabase.from("campanhas").select("*").eq("id", campanhaId).single();
      if (campErr || !campanha) {
        return new Response(JSON.stringify({ error: "Campanha não encontrada" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const body = await parseRequest(req, supabase, `campanha_${campanhaId}`);
      leadSchema.parse(body);

      const leadRecord = {
        campanha_id: campanhaId,
        nome: cleanStr(body.name ?? body.nome ?? body.nome_completo ?? body.full_name, 300) || "Sem nome",
        email: cleanStr(body.email ?? body.e_mail, 255),
        telefone: cleanStr(body.phone ?? body.telefone ?? body.whatsapp ?? body.tel, 30),
        observacoes: cleanStr(body.notes ?? body.observacoes ?? body.message ?? body.mensagem, 2000),
        status: "novo",
        payload: body,
      };

      const { data, error } = await supabase.from("leads").insert(leadRecord).select().single();
      if (error) {
        return new Response(JSON.stringify({ error: "Erro ao salvar lead" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    if (!/^[0-9a-f-]{36}$/i.test(automacaoId)) {
      return new Response(JSON.stringify({ error: "Invalid automacao_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: automacao, error: autoErr } = await supabase.from("automacoes").select("*").eq("id", automacaoId).single();
    if (autoErr || !automacao) {
      return new Response(JSON.stringify({ error: "Automação não encontrada" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await parseRequest(req, supabase, automacaoId);
    const tenantId = automacao.tenant_id || null;

    // If webhook disabled → save as test
    if (!automacao.webhook_enabled) {
      const { count } = await supabase.from("webhook_tests").select("*", { count: "exact", head: true }).eq("automacao_id", automacaoId);
      const label = `Teste ${(count ?? 0) + 1}`;
      const { data, error } = await supabase.from("webhook_tests").insert({ label, payload: body, automacao_id: automacaoId, tenant_id: tenantId }).select().single();
      if (error) return new Response(JSON.stringify({ error: "Erro ao salvar teste" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      if (!/^[0-9a-f-]{36}$/i.test(campId)) {
        return new Response(JSON.stringify({ error: "Invalid campanha reference" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const leadRecord = {
        campanha_id: campId,
        tenant_id: tenantId,
        nome: cleanStr(mapping ? resolve("nome") : (body.name ?? body.nome ?? body.nome_completo), 300) || "Sem nome",
        email: cleanStr(mapping ? resolve("email") : (body.email ?? body.e_mail), 255),
        telefone: cleanStr(mapping ? resolve("telefone") : (body.phone ?? body.telefone ?? body.whatsapp), 30),
        observacoes: cleanStr(mapping ? resolve("observacoes") : (body.notes ?? body.observacoes ?? body.message), 2000),
        status: "novo",
        payload: body,
      };
      const { data, error } = await supabase.from("leads").insert(leadRecord).select().single();
      if (error) return new Response(JSON.stringify({ error: "Erro ao salvar lead" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── MOTORISTA flow ──
    if (automacao.tipo === "solicitacao_motorista") {
      const possuiVeiculoRaw = mapping ? resolve("possui_veiculo") : (body.possui_veiculo ?? body.hasVehicle);
      const possuiVeiculo = possuiVeiculoRaw === true || possuiVeiculoRaw === "true" || possuiVeiculoRaw === "sim" || possuiVeiculoRaw === "Sim" || possuiVeiculoRaw === 1;
      const record: Record<string, unknown> = {
        tenant_id: tenantId,
        nome_completo: cleanStr(mapping ? resolve("nome_completo") : (body.nome_completo ?? body.name ?? body.nome), 300) || "Sem nome",
        cpf: cleanStr(mapping ? resolve("cpf") : (body.cpf ?? body.document), 20),
        telefone: cleanStr(mapping ? resolve("telefone") : (body.telefone ?? body.phone), 30),
        email: cleanStr(mapping ? resolve("email") : (body.email), 255),
        cidade: cleanStr(mapping ? resolve("cidade") : (body.cidade ?? body.city), 200),
        estado: cleanStr(mapping ? resolve("estado") : (body.estado ?? body.state), 50),
        cnh_numero: cleanStr(mapping ? resolve("cnh_numero") : (body.cnh_numero ?? body.cnh), 30),
        cnh_categoria: cleanStr(mapping ? resolve("cnh_categoria") : (body.cnh_categoria ?? body.cnhCategory), 10),
        possui_veiculo: possuiVeiculo,
        veiculo_marca: cleanStr(mapping ? resolve("veiculo_marca") : (body.veiculo_marca ?? body.vehicleBrand), 100),
        veiculo_modelo: cleanStr(mapping ? resolve("veiculo_modelo") : (body.veiculo_modelo ?? body.vehicleModel), 100),
        veiculo_ano: cleanStr(mapping ? resolve("veiculo_ano") : (body.veiculo_ano ?? body.vehicleYear), 10),
        veiculo_placa: cleanStr(mapping ? resolve("veiculo_placa") : (body.veiculo_placa ?? body.vehiclePlate), 10),
        experiencia: cleanStr(mapping ? resolve("experiencia") : (body.experiencia ?? body.experience), 2000),
        mensagem: cleanStr(mapping ? resolve("mensagem") : (body.mensagem ?? body.message), 2000),
        status: "pendente",
      };
      const { data, error } = await supabase.from("solicitacoes_motorista").insert(record).select().single();
      if (error) return new Response(JSON.stringify({ error: "Erro ao salvar solicitação" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── GRUPO flow ──
    if (automacao.tipo === "solicitacao_grupo") {
      const record: Record<string, unknown> = {
        tipo_veiculo: cleanStr(mapping ? resolve("tipo_veiculo") : (body.tipo_veiculo ?? body.vehicleType), 100),
        numero_passageiros: cleanInt(mapping ? resolve("numero_passageiros") : (body.numero_passageiros ?? body.passengers ?? body.passageiros)),
        endereco_embarque: cleanStr(mapping ? resolve("endereco_embarque") : (body.endereco_embarque ?? body.pickupAddress ?? body.embarque), 500),
        destino: cleanStr(mapping ? resolve("destino") : (body.destino ?? body.destination), 500),
        data_ida: (() => { const v = clean(mapping ? resolve("data_ida") : (body.data_ida ?? body.date)); return v ? String(v).substring(0, 10) : null; })(),
        hora_ida: cleanStr(mapping ? resolve("hora_ida") : (body.hora_ida ?? body.time), 10),
        data_retorno: (() => { const v = clean(mapping ? resolve("data_retorno") : (body.data_retorno ?? body.returnDate)); return v ? String(v).substring(0, 10) : null; })(),
        hora_retorno: cleanStr(mapping ? resolve("hora_retorno") : (body.hora_retorno ?? body.returnTime), 10),
        observacoes: cleanStr(mapping ? resolve("observacoes") : (body.observacoes ?? body.notes ?? body.message), 2000),
        cupom: cleanStr(mapping ? resolve("cupom") : (body.cupom ?? body.coupon), 50),
        cliente_nome: cleanStr(mapping ? resolve("cliente_nome") : (body.cliente_nome ?? body.name ?? body.nome), 300),
        cliente_email: cleanStr(mapping ? resolve("cliente_email") : (body.cliente_email ?? body.email), 255),
        cliente_whatsapp: cleanStr(mapping ? resolve("cliente_whatsapp") : (body.cliente_whatsapp ?? body.whatsapp ?? body.phone ?? body.telefone), 30),
        cliente_origem: cleanStr(mapping ? resolve("cliente_origem") : (body.cliente_origem ?? body.source ?? body.origin), 200),
        automacao_id: automacaoId,
        status: "pendente",
      };
      const { data, error } = await supabase.from("solicitacoes_grupos").insert(record).select().single();
      if (error) return new Response(JSON.stringify({ error: "Erro ao salvar solicitação de grupo" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── TRANSFER flow ──
    const tipoFromMapping = mapping ? resolve("tipo_viagem") : null;
    const tipo = cleanStr(tipoFromMapping ?? body.tipo_viagem, 50) as string;
    const validTipos = ["somente_ida", "ida_e_volta", "por_hora"];
    const record: Record<string, unknown> = {
      tipo_viagem: validTipos.includes(tipo) ? tipo : "somente_ida",
      cliente_nome: cleanStr(mapping ? resolve("cliente_nome") : (body.cliente_nome ?? body.clientName ?? body.name), 300),
      cliente_telefone: cleanStr(mapping ? resolve("cliente_telefone") : (body.cliente_telefone ?? body.clientPhone ?? body.phone), 30),
      cliente_email: cleanStr(mapping ? resolve("cliente_email") : (body.cliente_email ?? body.clientEmail ?? body.email), 255),
      cliente_origem: cleanStr(mapping ? resolve("cliente_origem") : (body.cliente_origem ?? body.source ?? body.origin), 200),
      automacao_id: automacaoId,
      status: "pendente",
    };

    if (mapping) {
      const allFields = ["ida_passageiros","ida_embarque","ida_data","ida_hora","ida_destino","ida_mensagem","ida_cupom","volta_passageiros","volta_embarque","volta_data","volta_hora","volta_destino","volta_mensagem","por_hora_passageiros","por_hora_endereco_inicio","por_hora_data","por_hora_hora","por_hora_qtd_horas","por_hora_ponto_encerramento","por_hora_itinerario","por_hora_cupom"];
      const intFields = ["ida_passageiros","volta_passageiros","por_hora_passageiros","por_hora_qtd_horas"];
      const dateFields = ["ida_data","volta_data","por_hora_data"];
      for (const f of allFields) {
        const val = resolve(f);
        if (intFields.includes(f)) {
          const n = cleanInt(val);
          record[f] = n !== null && n >= 0 && n <= 999 ? n : null;
        } else if (dateFields.includes(f)) {
          record[f] = val ? String(val).substring(0, 10) : null;
        } else {
          record[f] = cleanStr(val, 2000);
        }
      }
    } else {
      const ida = body.ida ?? {};
      const volta = body.volta ?? {};
      const porHora = body.por_hora ?? {};
      const finalTipo = record.tipo_viagem as string;
      if (finalTipo === "somente_ida" || finalTipo === "ida_e_volta") {
        const pax = cleanInt(body.ida_passageiros ?? (ida as any).passengers ?? body.passengers);
        record.ida_passageiros = pax !== null && pax >= 0 && pax <= 999 ? pax : null;
        record.ida_embarque = cleanStr(body.ida_embarque ?? (ida as any).pickupAddress ?? body.pickupAddress, 500);
        const idaDateRaw = clean(body.ida_data ?? (ida as any).date ?? body.date);
        record.ida_data = idaDateRaw ? String(idaDateRaw).substring(0, 10) : null;
        record.ida_hora = cleanStr(body.ida_hora ?? (ida as any).time ?? body.time, 10);
        record.ida_destino = cleanStr(body.ida_destino ?? (ida as any).destination ?? body.destination, 500);
        record.ida_mensagem = cleanStr(body.ida_mensagem ?? (ida as any).message ?? body.message, 2000);
        record.ida_cupom = cleanStr(body.ida_cupom ?? (ida as any).coupon ?? body.coupon, 50);
      }
      if (finalTipo === "ida_e_volta") {
        const pax = cleanInt(body.volta_passageiros ?? (volta as any).passengers ?? body.returnPassengers);
        record.volta_passageiros = pax !== null && pax >= 0 && pax <= 999 ? pax : null;
        record.volta_embarque = cleanStr(body.volta_embarque ?? (volta as any).pickupAddress ?? body.returnPickupAddress, 500);
        const voltaDateRaw = clean(body.volta_data ?? (volta as any).date ?? body.returnDate);
        record.volta_data = voltaDateRaw ? String(voltaDateRaw).substring(0, 10) : null;
        record.volta_hora = cleanStr(body.volta_hora ?? (volta as any).time ?? body.returnTime, 10);
        record.volta_destino = cleanStr(body.volta_destino ?? (volta as any).destination ?? body.returnDestination, 500);
        record.volta_mensagem = cleanStr(body.volta_mensagem ?? (volta as any).message ?? body.returnMessage, 2000);
      }
      if (finalTipo === "por_hora") {
        const pax = cleanInt(body.por_hora_passageiros ?? (porHora as any).passengers ?? body.passengers);
        record.por_hora_passageiros = pax !== null && pax >= 0 && pax <= 999 ? pax : null;
        record.por_hora_endereco_inicio = cleanStr(body.por_hora_endereco_inicio ?? (porHora as any).pickupAddress ?? body.pickupAddress, 500);
        const phDateRaw = clean(body.por_hora_data ?? (porHora as any).date ?? body.date);
        record.por_hora_data = phDateRaw ? String(phDateRaw).substring(0, 10) : null;
        record.por_hora_hora = cleanStr(body.por_hora_hora ?? (porHora as any).time ?? body.time, 10);
        const hrs = cleanInt(body.por_hora_qtd_horas ?? (porHora as any).hours ?? body.hours);
        record.por_hora_qtd_horas = hrs !== null && hrs >= 0 && hrs <= 999 ? hrs : null;
        record.por_hora_ponto_encerramento = cleanStr(body.por_hora_ponto_encerramento ?? (porHora as any).endPoint ?? body.endPoint, 500);
        record.por_hora_itinerario = cleanStr(body.por_hora_itinerario ?? (porHora as any).itinerary ?? body.itinerary, 2000);
        record.por_hora_cupom = cleanStr(body.por_hora_cupom ?? (porHora as any).coupon ?? body.coupon, 50);
      }
    }

    const { data, error } = await supabase.from("solicitacoes_transfer").insert(record).select().single();
    if (error) return new Response(JSON.stringify({ error: "Erro ao salvar solicitação" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation failed", details: err.errors }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
