import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if chat is enabled
    const { data: chatSetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "ai_chat_enabled")
      .maybeSingle();

    if (!chatSetting || chatSetting.value !== "true") {
      return new Response(JSON.stringify({ error: "Chat IA desativado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user tenant info for context
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const tenantId = userRole?.tenant_id;

    // Gather tenant-specific context
    let tenantContext = "";
    if (tenantId) {
      const [
        { data: tenant },
        { count: motoristaCount },
        { count: reservasTransferCount },
        { count: reservasGruposCount },
        { count: solTransferCount },
        { count: solGruposCount },
        { count: campanhasCount },
        { count: leadsCount },
        { data: profile },
      ] = await Promise.all([
        supabase.from("tenants").select("nome, slug").eq("id", tenantId).maybeSingle(),
        supabase.from("motoristas").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("reservas_transfer").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("reservas_grupos").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("solicitacoes_transfer").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("solicitacoes_grupos").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("campanhas").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("profiles").select("nome_completo").eq("user_id", user.id).maybeSingle(),
      ]);

      tenantContext = `
CONTEXTO DO USUÁRIO:
- Nome: ${profile?.nome_completo || "Não informado"}
- Empresa/Tenant: ${tenant?.nome || "Não identificado"}
- Total de motoristas cadastrados: ${motoristaCount ?? 0}
- Total de reservas transfer: ${reservasTransferCount ?? 0}
- Total de reservas grupos: ${reservasGruposCount ?? 0}
- Total de solicitações transfer: ${solTransferCount ?? 0}
- Total de solicitações grupos: ${solGruposCount ?? 0}
- Total de campanhas: ${campanhasCount ?? 0}
- Total de leads: ${leadsCount ?? 0}
`;
    }

    const { messages } = await req.json();

    const systemPrompt = `Você é o Assistente Virtual do sistema de gestão de transporte executivo e coletivo. Seu papel é ajudar administradores comuns a entenderem e utilizarem todas as funcionalidades do sistema.

${tenantContext}

FUNCIONALIDADES DO SISTEMA QUE VOCÊ DEVE EXPLICAR:

1. **Transfer (Executivo)**:
   - Solicitações: recebem pedidos de transfer via formulário/webhook
   - Reservas: confirmação de corridas com dados do cliente, motorista, veículo, valores
   - Geolocalização: rastreamento em tempo real de veículos
   - Contrato: geração de PDF de contrato de reserva

2. **Grupos (Coletivo)**:
   - Solicitações: pedidos de fretamento para grupos
   - Reservas: confirmação com detalhes de embarque, passageiros e valores

3. **Motoristas**:
   - Cadastros: registro completo com CNH, documentos, dados bancários
   - Veículos: cadastro de veículos vinculados a motoristas
   - Agendamentos: agenda de serviços dos motoristas
   - Solicitações: candidaturas de novos motoristas
   - Parcerias: empresas parceiras com subparceiros e veículos

4. **Campanhas & Leads**:
   - Campanhas de marketing com status e plataforma
   - Leads vinculados a campanhas com funil de conversão

5. **Network**:
   - Contatos comerciais organizados por categorias de rede
   - Gestão de prospects e potenciais parceiros

6. **Sistema**:
   - Configurações: nome do projeto, logo, fonte, cores
   - Automações: webhooks para integração externa
   - Comunicador: integração WhatsApp
   - Usuários: gestão de contas do sistema
   - Logs: histórico de ações

7. **Marketing**:
   - E-mails profissionais
   - QR Codes personalizados
   - Receptivos

8. **Website**:
   - Escolha de modelo de website
   - Briefing completo para criação do site
   - Domínio personalizado

9. **Google Business**:
   - Criação e gestão do perfil Google Meu Negócio

10. **Dashboard**:
    - Métricas consolidadas
    - Mapa de abrangência

11. **Anotações**: notas internas com editor rico

12. **Documentação**: contratos e políticas

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja claro, objetivo e amigável
- Use exemplos práticos quando possível
- Não invente funcionalidades que não existem
- Quando o usuário perguntar sobre números/dados, use o contexto fornecido
- Se não souber algo, diga que não tem essa informação`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para o chat IA." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
