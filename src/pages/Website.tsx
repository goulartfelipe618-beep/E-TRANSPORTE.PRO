import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, ArrowRight, ArrowLeft, Send, ExternalLink, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { useToast } from "@/hooks/use-toast";
import { useActivePage } from "@/contexts/PageContext";

const TIPOS_SERVICO = [
  "Transfer Executivo",
  "Transporte para Grupos",
  "Excursões",
  "Transporte Corporativo",
  "Transporte para Aeroporto",
  "Venda de Produtos Online",
];

const FUNCIONALIDADES = [
  "Botão WhatsApp",
  "Formulário de orçamento",
  "Integração com Google Maps",
  "Integração com Google Business Profile",
  "Área para grupos/excursões",
  "Área de produtos online",
  "Blog",
  "Área administrativa futura",
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  aguardando: { label: "Aguardando Análise", color: "bg-yellow-500" },
  em_producao: { label: "Em Produção", color: "bg-blue-500" },
  aprovado: { label: "Aprovado", color: "bg-green-500" },
  publicado: { label: "Publicado", color: "bg-emerald-600" },
  rejeitado: { label: "Rejeitado", color: "bg-destructive" },
};

export default function WebsitePage() {
  const tenantId = useTenantId();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    possui_dominio: false,
    dominio: "",
    provedor_atual: "",
    acesso_dns: false,
    tipos_servico: [] as string[],
    venda_produtos_online: false,
    produtos_descricao: "",
    produtos_quantidade: "",
    pagamento_online: false,
    nome_empresa: "",
    cidade_atuacao: "",
    regiao_atendida: "",
    diferenciais: "",
    frota: "",
    trabalha_24h: false,
    whatsapp: "",
    email_profissional: "",
    redes_sociais: "",
    publico_alvo: "",
    faixa_preco: "",
    captacao_orcamento: false,
    integracao_whatsapp: false,
    possui_logotipo: false,
    logo_url: "",
    cores_preferidas: "",
    estilo_desejado: "",
    funcionalidades: [] as string[],
  });

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    supabase
      .from("website_briefings")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setBriefing(data[0]);
        setLoading(false);
      });
  }, [tenantId]);

  const updateField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const toggleArrayItem = (key: "tipos_servico" | "funcionalidades", item: string) => {
    setForm((p) => {
      const arr = p[key];
      return { ...p, [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] };
    });
  };

  const handleSubmit = async () => {
    if (!tenantId) return;
    setSubmitting(true);
    const payload = {
      tenant_id: tenantId,
      status: "aguardando",
      possui_dominio: form.possui_dominio,
      dominio: form.dominio || null,
      provedor_atual: form.provedor_atual || null,
      acesso_dns: form.acesso_dns,
      tipos_servico: form.tipos_servico,
      venda_produtos_online: form.venda_produtos_online,
      produtos_descricao: form.produtos_descricao || null,
      produtos_quantidade: form.produtos_quantidade || null,
      pagamento_online: form.pagamento_online,
      nome_empresa: form.nome_empresa || null,
      cidade_atuacao: form.cidade_atuacao || null,
      regiao_atendida: form.regiao_atendida || null,
      diferenciais: form.diferenciais || null,
      frota: form.frota || null,
      trabalha_24h: form.trabalha_24h,
      whatsapp: form.whatsapp || null,
      email_profissional: form.email_profissional || null,
      redes_sociais: form.redes_sociais || null,
      publico_alvo: form.publico_alvo || null,
      faixa_preco: form.faixa_preco || null,
      captacao_orcamento: form.captacao_orcamento,
      integracao_whatsapp: form.integracao_whatsapp,
      possui_logotipo: form.possui_logotipo,
      logo_url: form.logo_url || null,
      cores_preferidas: form.cores_preferidas || null,
      estilo_desejado: form.estilo_desejado || null,
      funcionalidades: form.funcionalidades,
    };

    const { data, error } = await supabase.from("website_briefings").insert(payload as any).select().single();
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Briefing enviado!", description: "Aguarde a análise do administrador." });
      setBriefing(data);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Published state
  if (briefing?.status === "publicado") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website</h1>
          <p className="text-muted-foreground">Seu site profissional</p>
        </div>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">🌐 Seu site está ativo!</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Domínio:</strong> {briefing.dominio || "—"}</p>
                <p><strong>Status:</strong> <Badge className="bg-emerald-600">Online</Badge></p>
                {briefing.data_publicacao && (
                  <p><strong>Publicado em:</strong> {new Date(briefing.data_publicacao).toLocaleDateString("pt-BR")}</p>
                )}
              </div>
              {briefing.site_url && (
                <Button onClick={() => window.open(briefing.site_url, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visualizar Site
                </Button>
              )}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBriefing(null);
                    setStep(1);
                  }}
                >
                  Solicitar Alteração
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Existing briefing pending
  if (briefing && briefing.status !== "publicado") {
    const st = STATUS_MAP[briefing.status] || STATUS_MAP.aguardando;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website</h1>
          <p className="text-muted-foreground">Acompanhe o status do seu site</p>
        </div>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Briefing Enviado</h2>
              <Badge className={st.color + " text-white"}>{st.label}</Badge>
              {briefing.observacoes_master && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-left">
                  <strong>Observações:</strong>
                  <p className="mt-1">{briefing.observacoes_master}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Enviado em {new Date(briefing.created_at).toLocaleDateString("pt-BR")}
              </p>
              {briefing.status === "rejeitado" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setBriefing(null);
                    setStep(1);
                  }}
                >
                  Enviar Novo Briefing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wizard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Website</h1>
        <p className="text-muted-foreground">Tenha seu próprio site profissional para fechar mais corridas e transmitir autoridade.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center gap-1 ${s <= step ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {s}
            </div>
            <span className="text-xs hidden sm:inline">
              {s === 1 ? "Domínio" : s === 2 ? "Briefing" : "Enviar"}
            </span>
            {s < 3 && <ArrowRight className="h-3 w-3 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 - Domain */}
      {step === 1 && (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Verificação de Domínio</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Você já possui um domínio?</Label>
              <RadioGroup
                value={form.possui_dominio ? "sim" : "nao"}
                onValueChange={(v) => updateField("possui_dominio", v === "sim")}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sim" id="dom-sim" />
                  <Label htmlFor="dom-sim">Sim</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="nao" id="dom-nao" />
                  <Label htmlFor="dom-nao">Não</Label>
                </div>
              </RadioGroup>
            </div>

            {!form.possui_dominio && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Informe o domínio desejado para registro:</p>
                <Input
                  placeholder="nomedaempresa.com.br"
                  value={form.dominio}
                  onChange={(e) => updateField("dominio", e.target.value)}
                />
              </div>
            )}

            {form.possui_dominio && (
              <div className="space-y-3">
                <div>
                  <Label>Domínio</Label>
                  <Input placeholder="seusite.com.br" value={form.dominio} onChange={(e) => updateField("dominio", e.target.value)} />
                </div>
                <div>
                  <Label>Provedor atual</Label>
                  <Input placeholder="Ex: Registro.br, GoDaddy..." value={form.provedor_atual} onChange={(e) => updateField("provedor_atual", e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.acesso_dns} onCheckedChange={(v) => updateField("acesso_dns", !!v)} />
                  <Label>Tenho acesso ao DNS</Label>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Briefing */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Block 1 - Services */}
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Tipo de Serviço</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {TIPOS_SERVICO.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Checkbox checked={form.tipos_servico.includes(t)} onCheckedChange={() => toggleArrayItem("tipos_servico", t)} />
                  <Label>{t}</Label>
                </div>
              ))}
              {form.tipos_servico.includes("Venda de Produtos Online") && (
                <div className="ml-6 space-y-3 p-3 bg-muted/50 rounded-lg">
                  <div><Label>Quais produtos?</Label><Input value={form.produtos_descricao} onChange={(e) => updateField("produtos_descricao", e.target.value)} /></div>
                  <div><Label>Quantidade média?</Label><Input value={form.produtos_quantidade} onChange={(e) => updateField("produtos_quantidade", e.target.value)} /></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.pagamento_online} onCheckedChange={(v) => updateField("pagamento_online", !!v)} /><Label>Deseja pagamento online?</Label></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Block 2 - Company */}
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Estrutura da Empresa</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nome da empresa</Label><Input value={form.nome_empresa} onChange={(e) => updateField("nome_empresa", e.target.value)} /></div>
              <div><Label>Cidade principal</Label><Input value={form.cidade_atuacao} onChange={(e) => updateField("cidade_atuacao", e.target.value)} /></div>
              <div><Label>Região atendida</Label><Input value={form.regiao_atendida} onChange={(e) => updateField("regiao_atendida", e.target.value)} /></div>
              <div><Label>Frota</Label><Input placeholder="Sedan, Van, Micro-ônibus..." value={form.frota} onChange={(e) => updateField("frota", e.target.value)} /></div>
              <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} /></div>
              <div><Label>E-mail profissional</Label><Input value={form.email_profissional} onChange={(e) => updateField("email_profissional", e.target.value)} /></div>
              <div className="md:col-span-2"><Label>Diferenciais</Label><Textarea value={form.diferenciais} onChange={(e) => updateField("diferenciais", e.target.value)} /></div>
              <div><Label>Redes sociais</Label><Input placeholder="@instagram, facebook..." value={form.redes_sociais} onChange={(e) => updateField("redes_sociais", e.target.value)} /></div>
              <div className="flex items-center gap-2 mt-6"><Checkbox checked={form.trabalha_24h} onCheckedChange={(v) => updateField("trabalha_24h", !!v)} /><Label>Trabalha 24h?</Label></div>
            </CardContent>
          </Card>

          {/* Block 3 - Positioning */}
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Posicionamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Público-alvo</Label><Input placeholder="Executivo, turismo, empresas, eventos" value={form.publico_alvo} onChange={(e) => updateField("publico_alvo", e.target.value)} /></div>
              <div>
                <Label>Faixa de preço</Label>
                <Select value={form.faixa_preco} onValueChange={(v) => updateField("faixa_preco", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economico">Econômico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Checkbox checked={form.captacao_orcamento} onCheckedChange={(v) => updateField("captacao_orcamento", !!v)} /><Label>Captação de orçamento pelo site?</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.integracao_whatsapp} onCheckedChange={(v) => updateField("integracao_whatsapp", !!v)} /><Label>Integração com WhatsApp?</Label></div>
            </CardContent>
          </Card>

          {/* Block 4 - Visual */}
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Identidade Visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><Checkbox checked={form.possui_logotipo} onCheckedChange={(v) => updateField("possui_logotipo", !!v)} /><Label>Já possui logotipo?</Label></div>
              {form.possui_logotipo && (
                <div><Label>URL do logotipo</Label><Input placeholder="https://..." value={form.logo_url} onChange={(e) => updateField("logo_url", e.target.value)} /></div>
              )}
              <div><Label>Cores preferidas</Label><Input placeholder="Preto e dourado, azul marinho..." value={form.cores_preferidas} onChange={(e) => updateField("cores_preferidas", e.target.value)} /></div>
              <div>
                <Label>Estilo desejado</Label>
                <Select value={form.estilo_desejado} onValueChange={(v) => updateField("estilo_desejado", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="luxo">Luxo</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Block 5 - Features */}
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Funcionalidades Desejadas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {FUNCIONALIDADES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Checkbox checked={form.funcionalidades.includes(f)} onCheckedChange={() => toggleArrayItem("funcionalidades", f)} />
                  <Label>{f}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
            <Button onClick={() => setStep(3)}>Próximo <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {/* Step 3 - Review & Submit */}
      {step === 3 && (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Revisar e Enviar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Domínio:</strong> {form.dominio || "A definir"}</div>
              <div><strong>Empresa:</strong> {form.nome_empresa || "—"}</div>
              <div><strong>Cidade:</strong> {form.cidade_atuacao || "—"}</div>
              <div><strong>Estilo:</strong> {form.estilo_desejado || "—"}</div>
              <div className="md:col-span-2"><strong>Serviços:</strong> {form.tipos_servico.join(", ") || "—"}</div>
              <div className="md:col-span-2"><strong>Funcionalidades:</strong> {form.funcionalidades.join(", ") || "—"}</div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Enviar para Análise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

