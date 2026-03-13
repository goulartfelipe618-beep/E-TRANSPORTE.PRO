import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Globe, Shield, Star, Users, Zap, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Loader2, ChevronLeft, ChevronRight, Clock, Minus, Plus, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useActivePage } from "@/contexts/PageContext";

import websiteSlide1 from "@/assets/website-slide-1.jpg";
import websiteSlide2 from "@/assets/website-slide-2.jpg";
import websiteSlide3 from "@/assets/website-slide-3.jpg";

// --- Hero Carousel ---
const EMAIL_SLIDES = [
  { image: websiteSlide1, title: "Seu E-mail Profissional", subtitle: "Tenha um endereço como contato@suaempresa.com.br e transmita autoridade e credibilidade para hotéis e clientes executivos." },
  { image: websiteSlide2, title: "Passe Confiança para Hotéis e Empresas", subtitle: "Motoristas com e-mail profissional fecham mais contratos corporativos. Mostre que seu serviço é empresa, não bico." },
  { image: websiteSlide3, title: "Saia do Gmail Comum", subtitle: "Diferencie-se da concorrência com um e-mail exclusivo no seu domínio. Mais profissionalismo em cada mensagem enviada." },
];

function EmailHeroCarousel() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % EMAIL_SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);
  const prev = () => setCurrent((p) => (p - 1 + EMAIL_SLIDES.length) % EMAIL_SLIDES.length);
  const next = () => setCurrent((p) => (p + 1) % EMAIL_SLIDES.length);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: "21/9", minHeight: 220 }}>
      {EMAIL_SLIDES.map((slide, i) => (
        <div key={i} className={cn("absolute inset-0 transition-opacity duration-700", i === current ? "opacity-100 z-10" : "opacity-0 z-0")}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-6 md:px-12">
            <h2 className="text-white text-xl md:text-3xl font-bold drop-shadow-lg mb-2">{slide.title}</h2>
            <p className="text-white/85 text-sm md:text-base max-w-xl drop-shadow">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"><ChevronLeft className="h-5 w-5" /></button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"><ChevronRight className="h-5 w-5" /></button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {EMAIL_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={cn("w-2.5 h-2.5 rounded-full transition", i === current ? "bg-white scale-110" : "bg-white/50")} />
        ))}
      </div>
    </div>
  );
}

// --- Plans with dynamic qty ---
interface PlanDef {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Mail;
  pricePerAccount: number;
  originalPrice: number;
  discount: number;
  storage: string;
  defaultQty: number;
  minQty: number;
  maxQty: number;
  features: string[];
  highlight: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "go30",
    name: "Email Go 30 GB",
    subtitle: "E-mail profissional para negócios que estão começando",
    icon: Mail,
    originalPrice: 14.90,
    pricePerAccount: 13.41,
    discount: 10,
    storage: "30 GB",
    defaultQty: 2,
    minQty: 1,
    maxQty: 50,
    features: ["Domínio grátis por 1 ano", "30 GB de armazenamento", "Sincronização de e-mails, calendário e contatos", "Acesso pelo celular", "Antivírus e antispam"],
    highlight: false,
  },
  {
    id: "go50",
    name: "Email Go 50 GB",
    subtitle: "Mais espaço de armazenamento para empresas em crescimento",
    icon: Star,
    originalPrice: 19.90,
    pricePerAccount: 17.91,
    discount: 10,
    storage: "50 GB",
    defaultQty: 2,
    minQty: 1,
    maxQty: 50,
    features: ["Domínio grátis por 1 ano", "50 GB de armazenamento", "Sincronização de e-mails, calendário e contatos", "Suporte prioritário"],
    highlight: true,
  },
  {
    id: "locaweb15",
    name: "Email Locaweb 15 GB",
    subtitle: "Múltiplas contas de e-mail com o melhor custo-benefício",
    icon: Users,
    originalPrice: 6.90,
    pricePerAccount: 6.21,
    discount: 10,
    storage: "15 GB",
    defaultQty: 25,
    minQty: 5,
    maxQty: 100,
    features: ["15 GB de armazenamento", "Ideal para equipes grandes", "Gestão centralizada"],
    highlight: false,
  },
];

const BENEFITS = [
  "Mais autoridade no WhatsApp",
  "Mais confiança para hotéis e empresas",
  "Evita cair no spam",
  "Passa imagem de empresa estruturada",
  "Integração com Google Business",
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- Quantity Selector Component ---
function QtySelector({ qty, min, max, onChange }: { qty: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, qty - 1)); }}
        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition disabled:opacity-40"
        disabled={qty <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center font-bold text-foreground text-sm">{qty}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, qty + 1)); }}
        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition disabled:opacity-40"
        disabled={qty >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface EmailSolicitation {
  id: string;
  status: string;
  email_solicitado: string;
  email_criado: string | null;
  webmail_url: string | null;
  plano: string;
  dominio: string;
  created_at: string;
}

export default function EmailBusiness() {
  const tenantId = useTenantId();
  const { toast } = useToast();
  const { setActivePage } = useActivePage();
  const [loading, setLoading] = useState(true);
  const [solicitations, setSolicitations] = useState<EmailSolicitation[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [step, setStep] = useState(0);
  const [domainOption, setDomainOption] = useState<"novo" | "existente" | "">("");
  const [domain, setDomain] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planQtys, setPlanQtys] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    PLANS.forEach((p) => { m[p.id] = p.defaultQty; });
    return m;
  });
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nomeEmail, setNomeEmail] = useState("contato");

  const emailPreview = domain ? `${nomeEmail}@${domain}` : `${nomeEmail}@suaempresa.com.br`;

  const selectedPlanDef = PLANS.find((p) => p.id === selectedPlan);
  const selectedQty = selectedPlan ? (planQtys[selectedPlan] || 1) : 1;
  const monthlyTotal = selectedPlanDef ? selectedPlanDef.pricePerAccount * selectedQty : 0;
  const yearlyTotal = monthlyTotal * 12;

  useEffect(() => {
    if (!tenantId) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from("solicitacoes_email")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSolicitations((data as EmailSolicitation[]) || []);
        setLoading(false);
      });
  }, [tenantId]);

  const activeEmails = solicitations.filter((s) => s.status === "ativo" && s.email_criado && s.webmail_url);
  const pendingSolicitations = solicitations.filter((s) => s.status === "pendente" || s.status === "aprovada");

  const handleSubmit = async () => {
    if (!tenantId || !selectedPlanDef) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const valorStr = `${formatBRL(monthlyTotal)}/mês (${selectedQty}x R$ ${formatBRL(selectedPlanDef.pricePerAccount)})`;

    const { error } = await supabase.from("solicitacoes_email").insert({
      tenant_id: tenantId,
      user_id: user.id,
      nome_completo: nomeCompleto,
      nome_empresa: nomeEmpresa,
      dominio: domain,
      email_solicitado: emailPreview,
      plano: `${selectedPlanDef.name} (${selectedQty} contas)`,
      valor: valorStr,
      status: "pendente",
    });

    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Solicitação enviada!", description: "Você será contatado via WhatsApp para prosseguir." });
      const { data } = await supabase.from("solicitacoes_email").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
      setSolicitations((data as EmailSolicitation[]) || []);
      setStep(0);
      setDomainOption("");
      setDomain("");
      setSelectedPlan("");
      setPlanQtys(() => {
        const m: Record<string, number> = {};
        PLANS.forEach((p) => { m[p.id] = p.defaultQty; });
        return m;
      });
      setNomeCompleto("");
      setNomeEmpresa("");
      setNomeEmail("contato");
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Dashboard view
  if ((activeEmails.length > 0 || pendingSolicitations.length > 0) && step === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">E-mail Business</h1>
            <p className="text-muted-foreground">Seus e-mails profissionais</p>
          </div>
          <Button onClick={() => setStep(1)} className="gap-2 w-full sm:w-auto">
            <Mail className="h-4 w-4" /> Nova Solicitação
          </Button>
        </div>

        {activeEmails.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Seus E-mails Ativos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeEmails.map((email) => (
                <Card key={email.id} className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <span className="font-mono font-bold text-foreground">{email.email_criado}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Plano: {email.plano}</p>
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Ativo
                        </Badge>
                      </div>
                      <Button onClick={() => window.open(email.webmail_url!, "_blank")} className="gap-2 shrink-0">
                        <ExternalLink className="h-4 w-4" /> Acessar E-mail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pendingSolicitations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Solicitações em Andamento</h2>
            {pendingSolicitations.map((s) => (
              <Card key={s.id} className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <p className="font-mono text-sm text-foreground">{s.email_solicitado}</p>
                      <p className="text-sm text-muted-foreground">Plano: {s.plano} — Domínio: {s.dominio}</p>
                      <p className="text-xs text-muted-foreground">Enviada em {new Date(s.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Badge className={s.status === "aprovada" ? "bg-blue-500/15 text-blue-700" : "bg-amber-500/15 text-amber-700"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {s.status === "aprovada" ? "Aprovada — Aguardando Ativação" : "Pendente"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Landing page
  if (step === 0) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <EmailHeroCarousel />
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Mail className="h-4 w-4" /> E-mail Business
          </div>
          <h1 className="text-3xl font-bold text-foreground">Seu e-mail profissional para fechar mais corridas</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pare de usar Gmail comum. Tenha um e-mail com o nome da sua empresa e passe autoridade para hotéis, empresas e clientes executivos.
          </p>
        </div>

        <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Exemplo:</p>
            <p className="text-xl font-mono font-bold text-primary">contato@transporteexecutivo.com.br</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /><span>{b}</span>
            </div>
          ))}
        </div>

        <Card className="border-none bg-muted/50 max-w-2xl mx-auto">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Pare de parecer amador</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Motoristas que usam Gmail comum passam menos confiança para hotéis, empresas e executivos.
              Com um e-mail profissional você mostra que seu serviço é empresa, não bico.
            </p>
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="text-xl font-bold text-center text-foreground mb-6">Escolha seu plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const qty = planQtys[plan.id];
              const monthTotal = plan.pricePerAccount * qty;
              const yearTotal = monthTotal * 12;

              return (
                <Card key={plan.id} className={cn("relative transition-all hover:shadow-lg flex flex-col", plan.highlight && "border-primary ring-2 ring-primary/30")}>
                  {plan.highlight && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">Recomendado</Badge>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <plan.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Price */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground line-through">R$ {formatBRL(plan.originalPrice)}</span>
                        <Badge variant="secondary" className="text-xs">{plan.discount}% OFF</Badge>
                      </div>
                      <div className="mt-1">
                        <span className="text-3xl font-bold text-foreground">R$ {formatBRL(plan.pricePerAccount)}</span>
                        <span className="text-sm text-muted-foreground">/por conta</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        R$ {formatBRL(monthTotal)} por mês*
                      </p>
                    </div>

                    {/* Qty selector */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Contas de e-mail</span>
                        <QtySelector
                          qty={qty}
                          min={plan.minQty}
                          max={plan.maxQty}
                          onChange={(v) => setPlanQtys((prev) => ({ ...prev, [plan.id]: v }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Total por ano: <strong className="text-foreground">R$ {formatBRL(yearTotal)}</strong></p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /><span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      className="w-full gap-2"
                      variant={plan.highlight ? "default" : "outline"}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setStep(1);
                      }}
                    >
                      Contratar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">* Pagamento anual e antecipado. ** Domínio grátis válido por 1 ano nas extensões .BR</p>
        </div>
      </div>
    );
  }

  // Wizard steps
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        {["Domínio", "Plano", "Dados", "Confirmação"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={cn("flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0", i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</div>
            <span className={cn("text-xs hidden sm:inline", i + 1 <= step ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
            {i < 3 && <div className={cn("flex-1 h-0.5", i + 1 < step ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5 text-primary" />Escolha seu domínio</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Você já tem um domínio?</Label>
              <RadioGroup value={domainOption || undefined} onValueChange={(v) => setDomainOption(v as "novo" | "existente")} className="flex gap-4 mt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="novo" id="email-dom-novo" /><Label htmlFor="email-dom-novo">Quero registrar um novo</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="existente" id="email-dom-existente" /><Label htmlFor="email-dom-existente">Já tenho um domínio</Label></div>
              </RadioGroup>
            </div>
            {domainOption && (
              <div className="space-y-2">
                <Label>{domainOption === "novo" ? "Nome desejado para o domínio" : "Informe seu domínio"}</Label>
                <Input placeholder="suaempresa.com.br" value={domain} onChange={(e) => setDomain(e.target.value)} />
                {domainOption === "existente" && <p className="text-xs text-muted-foreground">Será necessário apontar o DNS para ativação.</p>}
                {domainOption === "novo" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Pesquise a disponibilidade antes de continuar.</p>
                    <Button variant="outline" size="sm" onClick={() => setActivePage("dominios")} className="gap-2"><Globe className="h-4 w-4" />Pesquisar Domínio</Button>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button disabled={!domain} onClick={() => setStep(2)}>Próximo<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Star className="h-5 w-5 text-primary" />Confirme seu plano</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {PLANS.map((plan) => {
              const qty = planQtys[plan.id];
              const total = plan.pricePerAccount * qty;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all space-y-3",
                    selectedPlan === plan.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <plan.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.storage} por conta</p>
                      </div>
                    </div>
                    {plan.highlight && <Badge className="bg-primary text-primary-foreground text-xs">Recomendado</Badge>}
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Contas:</span>
                    </div>
                    <QtySelector
                      qty={qty}
                      min={plan.minQty}
                      max={plan.maxQty}
                      onChange={(v) => setPlanQtys((prev) => ({ ...prev, [plan.id]: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{qty}x R$ {formatBRL(plan.pricePerAccount)}</span>
                    <span className="font-bold text-foreground">R$ {formatBRL(total)}/mês</span>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button disabled={!selectedPlan} onClick={() => setStep(3)}>Próximo<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary" />Seus dados</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome completo</Label><Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Felipe da Silva" /></div>
              <div className="space-y-2"><Label>Nome da empresa</Label><Input value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} placeholder="Executivo Balneário" /></div>
            </div>
            <div className="space-y-2">
              <Label>Nome do e-mail principal</Label>
              <div className="flex items-center gap-1">
                <Input value={nomeEmail} onChange={(e) => setNomeEmail(e.target.value)} placeholder="contato" className="max-w-[180px]" />
                <span className="text-sm text-muted-foreground">@{domain || "suaempresa.com.br"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Sugestões: contato, reservas, financeiro</p>
            </div>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">E-mail principal:</p>
                <p className="text-lg font-mono font-bold text-primary">{emailPreview}</p>
              </CardContent>
            </Card>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button disabled={!nomeCompleto || !nomeEmpresa || !nomeEmail} onClick={() => setStep(4)}>Próximo<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-primary" />Confirme sua solicitação</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Domínio</span><span className="font-medium text-foreground">{domain}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Plano</span><span className="font-medium text-foreground">{selectedPlanDef?.name}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Contas de e-mail</span><span className="font-bold text-foreground">{selectedQty} contas</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Valor mensal</span><span className="font-bold text-foreground">R$ {formatBRL(monthlyTotal)}/mês</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Valor anual</span><span className="font-bold text-primary">R$ {formatBRL(yearlyTotal)}/ano</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">E-mail principal</span><span className="font-mono font-medium text-primary">{emailPreview}</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground">Responsável</span><span className="font-medium text-foreground">{nomeCompleto}</span></div>
            </div>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-4 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">📋 Próximos passos:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Sua solicitação será analisada pela equipe</li>
                  <li>Entraremos em contato via WhatsApp para pagamento</li>
                  <li>Após confirmação, seus e-mails serão criados e ativados</li>
                </ol>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Enviar Solicitação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
