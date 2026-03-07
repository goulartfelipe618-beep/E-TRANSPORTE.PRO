import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Globe, ArrowRight, ArrowLeft, Send, ExternalLink, CheckCircle2, Clock,
  Loader2, Eye, Pencil, LayoutTemplate, Upload, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { useToast } from "@/hooks/use-toast";
import websiteSlide1 from "@/assets/website-slide-1.jpg";
import websiteSlide2 from "@/assets/website-slide-2.jpg";
import websiteSlide3 from "@/assets/website-slide-3.jpg";

/* ────────── Website Hero Slides ────────── */
const WEBSITE_SLIDES = [
  { image: websiteSlide1, title: "Crie Seu Site Profissional", subtitle: "Tenha presença online com um site exclusivo para transporte executivo. Design premium e responsivo." },
  { image: websiteSlide2, title: "100% Responsivo e Moderno", subtitle: "Seu site funciona perfeitamente em celular, tablet e computador. Formulário de orçamento integrado." },
  { image: websiteSlide3, title: "Destaque-se no Mercado", subtitle: "Motoristas com site próprio transmitem mais credibilidade e conquistam mais clientes." },
];

function WebsiteHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % WEBSITE_SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + WEBSITE_SLIDES.length) % WEBSITE_SLIDES.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <div className="relative h-[200px] sm:h-[280px] md:h-[340px]">
        {WEBSITE_SLIDES.map((slide, i) => (
          <div
            key={`ws-slide-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight max-w-xl">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base text-white/80 mt-2 max-w-lg">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-lg p-2 transition-colors">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-lg p-2 transition-colors">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {WEBSITE_SLIDES.map((_, i) => (
          <button key={`ws-dot-${i}`} onClick={() => setCurrent(i)} className={`h-2.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

/* ────────── Constants ────────── */
const TIPOS_SERVICO = [
  "Transfer Executivo", "Transporte para Grupos", "Excursões",
  "Transporte Corporativo", "Transporte para Aeroporto", "Venda de Produtos Online",
];

const FUNCIONALIDADES = [
  "Botão WhatsApp", "Formulário de orçamento", "Integração com Google Maps",
  "Integração com Google Business Profile", "Área para grupos/excursões",
  "Área de produtos online", "Blog", "Área administrativa futura",
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  aguardando: { label: "Aguardando Análise", color: "bg-yellow-500" },
  em_producao: { label: "Em Produção", color: "bg-blue-500" },
  aprovado: { label: "Aprovado", color: "bg-green-500" },
  publicado: { label: "Publicado", color: "bg-emerald-600" },
  rejeitado: { label: "Rejeitado", color: "bg-destructive" },
};

const emptyForm = {
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
};

/* ────────── Template type ────────── */
interface TemplateData {
  id: string;
  nome: string;
  preview_url: string;
  thumbnail_url: string;
}

/* ────────── Template Card with scroll-on-hover ────────── */
function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateData;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className={`border-2 transition-all cursor-pointer overflow-hidden ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/40"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 2000)}
      onClick={onSelect}
    >
      <div className="relative h-64 overflow-hidden bg-muted">
        {template.thumbnail_url ? (
          <div
            className="absolute inset-x-0 top-0 w-full transition-transform duration-[3000ms] ease-in-out"
            style={{
              backgroundImage: `url(${template.thumbnail_url})`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
              height: "200%",
              transform: hovered ? "translateY(-50%)" : "translateY(0%)",
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sem imagem</div>
        )}
        {selected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-foreground">{template.nome}</h3>
        <div className="flex flex-col gap-2">
          {template.preview_url && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={(e) => { e.stopPropagation(); window.open(template.preview_url, "_blank"); }}
            >
              <Eye className="h-3 w-3 mr-1" /> Ver Modelo
            </Button>
          )}
          <Button
            size="sm"
            variant={selected ? "default" : "secondary"}
            className="w-full"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            {selected ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Selecionado</> : "Selecionar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────── Logo Upload Field ────────── */
function LogoUploadField({
  logoUrl,
  onLogoUrlChange,
  tenantId,
}: {
  logoUrl: string;
  onLogoUrlChange: (url: string) => void;
  tenantId: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const fileName = `briefing-logo-${tenantId || "tmp"}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(fileName, file, { contentType: file.type, upsert: true });
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
    onLogoUrlChange(urlData.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <Label>Logotipo da empresa</Label>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {logoUrl ? (
        <div className="mt-2 space-y-2">
          <div className="rounded border p-2 bg-muted inline-block">
            <img src={logoUrl} alt="Logo" className="max-h-24 max-w-48 object-contain" />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-3 w-3 mr-1" /> Trocar
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-destructive" onClick={() => onLogoUrlChange("")}>
              <X className="h-3 w-3 mr-1" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">{uploading ? "Enviando..." : "Clique para enviar o logotipo"}</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP (máx 5MB)</p>
        </div>
      )}
    </div>
  );
}

/* ────────── Main Page ────────── */
export default function WebsitePage() {
  const tenantId = useTenantId();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<any>(null);
  const [templates, setTemplates] = useState<TemplateData[]>([]);

  const [phase, setPhase] = useState<"gallery" | "briefing" | "submitted" | "published">("gallery");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Fetch templates from DB
  useEffect(() => {
    supabase
      .from("website_templates")
      .select("id, nome, preview_url, thumbnail_url")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        setTemplates((data as TemplateData[]) || []);
      });
  }, []);

  // Fetch existing briefing
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
        if (data && data.length > 0) {
          const b = data[0];
          setBriefing(b);
          setSelectedTemplate((b as any).modelo_selecionado || null);
          if (b.status === "publicado") {
            setPhase("published");
          } else {
            setPhase("submitted");
            populateFormFromBriefing(b);
          }
        }
        setLoading(false);
      });
  }, [tenantId]);

  const populateFormFromBriefing = (b: any) => {
    setForm({
      dominio: b.dominio || "",
      provedor_atual: b.provedor_atual || "",
      acesso_dns: b.acesso_dns || false,
      tipos_servico: b.tipos_servico || [],
      venda_produtos_online: b.venda_produtos_online || false,
      produtos_descricao: b.produtos_descricao || "",
      produtos_quantidade: b.produtos_quantidade || "",
      pagamento_online: b.pagamento_online || false,
      nome_empresa: b.nome_empresa || "",
      cidade_atuacao: b.cidade_atuacao || "",
      regiao_atendida: b.regiao_atendida || "",
      diferenciais: b.diferenciais || "",
      frota: b.frota || "",
      trabalha_24h: b.trabalha_24h || false,
      whatsapp: b.whatsapp || "",
      email_profissional: b.email_profissional || "",
      redes_sociais: b.redes_sociais || "",
      publico_alvo: b.publico_alvo || "",
      faixa_preco: b.faixa_preco || "",
      captacao_orcamento: b.captacao_orcamento || false,
      integracao_whatsapp: b.integracao_whatsapp || false,
      possui_logotipo: b.possui_logotipo || false,
      logo_url: b.logo_url || "",
      cores_preferidas: b.cores_preferidas || "",
      estilo_desejado: b.estilo_desejado || "",
      funcionalidades: b.funcionalidades || [],
    });
    setSelectedTemplate((b as any).modelo_selecionado || null);
  };

  const updateField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const toggleArrayItem = (key: "tipos_servico" | "funcionalidades", item: string) => {
    setForm((p) => {
      const arr = p[key];
      return { ...p, [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] };
    });
  };

  const getTemplateInfo = () => templates.find((t) => t.id === selectedTemplate);

  const buildPayload = () => {
    const tpl = getTemplateInfo();
    return {
      tenant_id: tenantId,
      status: "aguardando",
      possui_dominio: !!form.dominio,
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
      modelo_selecionado: selectedTemplate || null,
      modelo_nome: tpl?.nome || null,
      modelo_preview_url: tpl?.preview_url || null,
    };
  };

  const handleSubmit = async () => {
    if (!tenantId || !selectedTemplate) {
      toast({ title: "Selecione um modelo", variant: "destructive" });
      return;
    }
    if (!form.dominio.trim()) {
      toast({ title: "Domínio obrigatório", description: "Informe o domínio desejado.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = buildPayload();

    if (editing && briefing) {
      const { error } = await supabase.from("website_briefings").update(payload as any).eq("id", briefing.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Briefing atualizado!", description: "As alterações foram enviadas." });
        const { data } = await supabase.from("website_briefings").select("*").eq("id", briefing.id).single();
        if (data) setBriefing(data);
        setEditing(false);
        setPhase("submitted");
      }
    } else {
      const { data, error } = await supabase.from("website_briefings").insert(payload as any).select().single();
      if (error) {
        toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Briefing enviado!", description: "Aguarde a análise do administrador." });
        setBriefing(data);
        setPhase("submitted");
      }
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

  /* ─── Published ─── */
  if (phase === "published" && briefing) {
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
                <p><strong>Status:</strong> <Badge className="bg-emerald-600 text-white">Online</Badge></p>
                {briefing.data_publicacao && (
                  <p><strong>Publicado em:</strong> {new Date(briefing.data_publicacao).toLocaleDateString("pt-BR")}</p>
                )}
              </div>
              {briefing.site_url && (
                <Button onClick={() => window.open(briefing.site_url, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Visualizar Site
                </Button>
              )}
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => { setBriefing(null); setPhase("gallery"); setForm({ ...emptyForm }); setSelectedTemplate(null); }}>
                  Solicitar Novo Site
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Submitted / Pending ─── */
  if (phase === "submitted" && briefing && !editing) {
    const st = STATUS_MAP[briefing.status] || STATUS_MAP.aguardando;
    const tplName = (briefing as any).modelo_nome || templates.find((t) => t.id === (briefing as any).modelo_selecionado)?.nome;
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

              {tplName && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <strong>Modelo:</strong> {tplName}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <strong>Domínio solicitado:</strong> {briefing.dominio || "—"}
              </div>

              {briefing.observacoes_master && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-left">
                  <strong>Observações do administrador:</strong>
                  <p className="mt-1">{briefing.observacoes_master}</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Enviado em {new Date(briefing.created_at).toLocaleDateString("pt-BR")}
              </p>

              {briefing.status !== "em_producao" && briefing.status !== "publicado" && (
                <div className="pt-4 border-t flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(true);
                      setPhase("gallery");
                      populateFormFromBriefing(briefing);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Alterar Modelo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(true);
                      setPhase("briefing");
                      setStep(1);
                      populateFormFromBriefing(briefing);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Editar Briefing
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Template Gallery ─── */
  if (phase === "gallery") {
    return (
      <div className="space-y-6">
        {/* Hero Carousel */}
        <WebsiteHeroCarousel />

        <div>
          <h1 className="text-2xl font-bold text-foreground">Website</h1>
          <p className="text-muted-foreground">Escolha o modelo ideal para o seu site profissional.</p>
        </div>

        {templates.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum modelo disponível no momento. Entre em contato com o administrador.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedTemplate === t.id}
                  onSelect={() => setSelectedTemplate(t.id)}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                disabled={!selectedTemplate}
                onClick={() => { setPhase("briefing"); setStep(1); }}
              >
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Continuar com este modelo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ─── Briefing Wizard ─── */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Website — Briefing</h1>
        <p className="text-muted-foreground">
          Modelo: <strong>{getTemplateInfo()?.nome || "Selecionado"}</strong>{" "}
          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setPhase("gallery")}>
            (alterar)
          </Button>
        </p>
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
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Domínio Desejado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Informe o domínio que deseja para seu site. Nós verificaremos a disponibilidade e entraremos em contato.
            </p>
            <div>
              <Label>Domínio desejado <span className="text-destructive">*</span></Label>
              <Input
                placeholder="nomedaempresa.com.br"
                value={form.dominio}
                onChange={(e) => updateField("dominio", e.target.value)}
              />
            </div>
            <div>
              <Label>Provedor atual (se já possui domínio)</Label>
              <Input
                placeholder="Ex: Registro.br, GoDaddy..."
                value={form.provedor_atual}
                onChange={(e) => updateField("provedor_atual", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.acesso_dns} onCheckedChange={(v) => updateField("acesso_dns", !!v)} />
              <Label>Já possuo este domínio e tenho acesso ao DNS</Label>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPhase("gallery")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button
                onClick={() => {
                  if (!form.dominio.trim()) {
                    toast({ title: "Informe o domínio desejado", variant: "destructive" });
                    return;
                  }
                  setStep(2);
                }}
              >
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Briefing details */}
      {step === 2 && (
        <div className="space-y-4">
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

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Identidade Visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><Checkbox checked={form.possui_logotipo} onCheckedChange={(v) => updateField("possui_logotipo", !!v)} /><Label>Já possui logotipo?</Label></div>
              {form.possui_logotipo && (
                <LogoUploadField logoUrl={form.logo_url} onLogoUrlChange={(url) => updateField("logo_url", url)} tenantId={tenantId} />
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
            <Button onClick={() => setStep(3)}>Revisar e Enviar <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {/* Step 3 - Review */}
      {step === 3 && (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Revisar e Enviar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Modelo:</strong> {getTemplateInfo()?.nome || "—"}</div>
              <div><strong>Domínio:</strong> {form.dominio || "—"}</div>
              <div><strong>Empresa:</strong> {form.nome_empresa || "—"}</div>
              <div><strong>Cidade:</strong> {form.cidade_atuacao || "—"}</div>
              <div><strong>Estilo:</strong> {form.estilo_desejado || "—"}</div>
              <div><strong>WhatsApp:</strong> {form.whatsapp || "—"}</div>
              <div className="md:col-span-2"><strong>Serviços:</strong> {form.tipos_servico.join(", ") || "—"}</div>
              <div className="md:col-span-2"><strong>Funcionalidades:</strong> {form.funcionalidades.join(", ") || "—"}</div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>⏱ Prazo estimado:</strong> Até 3 dias úteis após aprovação do briefing e confirmação do domínio.
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {editing ? "Salvar Alterações" : "Enviar para Análise"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
