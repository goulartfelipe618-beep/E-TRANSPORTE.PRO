import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LABEL_MAP: Record<string, string> = {
  tipo: "Tipo", tipo_viagem: "Tipo de Viagem",
  cliente_nome: "Nome do Cliente", cliente_telefone: "Telefone do Cliente",
  cliente_email: "E-mail do Cliente", cliente_origem: "Origem do Cliente",
  cliente_cpf_cnpj: "CPF/CNPJ", cliente_whatsapp: "WhatsApp do Cliente",
  embarque: "Local de Embarque", destino: "Local de Destino",
  data: "Data", hora: "Hora", status: "Status",
  motorista_nome: "Motorista", motorista_telefone: "Tel. Motorista",
  veiculo: "Veículo", valor_total: "Valor Total", valor_base: "Valor Base",
  desconto_percentual: "Desconto (%)", metodo_pagamento: "Pagamento",
  observacoes: "Observações", nome: "Nome", nome_completo: "Nome Completo",
  cpf: "CPF", telefone: "Telefone", email: "E-mail", cidade: "Cidade", estado: "Estado",
  cnh_categoria: "Categoria CNH", cnh_numero: "Número CNH",
  possui_veiculo: "Possui Veículo", experiencia: "Experiência", mensagem: "Mensagem",
  razao_social: "Razão Social", nome_fantasia: "Nome Fantasia", cnpj: "CNPJ",
  whatsapp: "WhatsApp", dominio: "Domínio", plano: "Plano", valor: "Valor",
  nome_empresa: "Empresa", nome_projeto: "Projeto",
  telefone_whatsapp: "WhatsApp", instance_name: "Instância",
  ida_embarque: "Embarque (Ida)", ida_destino: "Destino (Ida)",
  ida_data: "Data (Ida)", ida_hora: "Hora (Ida)",
  volta_embarque: "Embarque (Volta)", volta_destino: "Destino (Volta)",
  volta_data: "Data (Volta)", volta_hora: "Hora (Volta)",
  numero_passageiros: "Passageiros", data_ida: "Data Ida", data_retorno: "Data Retorno",
  hora_ida: "Hora Ida", hora_retorno: "Hora Retorno", endereco_embarque: "Embarque",
  tipo_veiculo: "Tipo Veículo", cupom: "Cupom", codigo: "Código",
  endereco: "Endereço", cep: "CEP", rg: "RG",
};

function getLabel(key: string): string {
  return LABEL_MAP[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const SKIP_KEYS = new Set(["id", "user_id", "tenant_id", "created_at", "updated_at", "automacao_id", "solicitacao_id"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
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

    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    console.log("Webhook received:", JSON.stringify({ webhook_id: webhook.id, categoria: webhook.categoria, payload }));

    // Forward if enabled
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
        forwardResult = { status: fwdResponse.status, success: fwdResponse.ok };
      } catch (e) {
        forwardResult = { success: false, error: String(e) };
      }
    }

    // Auto-comunicar if enabled
    let autoComunicarResult = null;
    if (webhook.auto_comunicar && webhook.auto_comunicar_config) {
      const config = webhook.auto_comunicar_config as any;
      const comunicadorId = config.comunicador_id;

      if (comunicadorId) {
        try {
          // Fetch comunicador
          const { data: comunicador } = await supabase
            .from("comunicadores")
            .select("*")
            .eq("id", comunicadorId)
            .eq("ativo", true)
            .single();

          if (comunicador && comunicador.webhook_url) {
            // Build formatted message
            const lines = Object.entries(payload)
              .filter(([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== undefined && v !== "")
              .map(([k, v]) => `*${getLabel(k)}:* ${formatValue(v)}`);

            const parts: string[] = [];
            const saudacao = config.saudacao?.trim();
            if (saudacao) parts.push(saudacao);
            if (lines.length > 0) parts.push("\n" + lines.join("\n"));
            const msgAdicional = config.mensagem_adicional?.trim();
            if (msgAdicional) parts.push("\n" + msgAdicional);

            const mensagemFormatada = parts.join("\n");

            const body = {
              ...payload,
              mensagem_formatada: mensagemFormatada,
              mensagem_adicional: msgAdicional || null,
              comunicador_nome: comunicador.nome,
              auto_comunicar: true,
            };

            const res = await fetch(comunicador.webhook_url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            autoComunicarResult = { success: res.ok, status: res.status };
            console.log("Auto-comunicar sent:", { success: res.ok, status: res.status });
          } else {
            autoComunicarResult = { success: false, error: "Comunicador não encontrado ou inativo" };
          }
        } catch (e) {
          autoComunicarResult = { success: false, error: String(e) };
          console.error("Auto-comunicar error:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dados recebidos com sucesso",
        forwarded: forwardResult,
        auto_comunicar: autoComunicarResult,
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
