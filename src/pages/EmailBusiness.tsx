import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Globe, Shield, Smartphone, CheckCircle2, ArrowRight, ArrowLeft, Star, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "start",
    name: "Motorista Start",
    icon: Mail,
    price: "14,90",
    features: ["1 conta de e-mail profissional", "30 GB de armazenamento", "Domínio incluso por 1 ano", "Acesso pelo celular", "Antivírus e antispam"],
    ideal: "Motorista individual",
    highlight: false,
  },
  {
    id: "pro",
    name: "Executivo Pro",
    icon: Star,
    price: "19,90",
    features: ["1 conta com 50 GB", "Domínio incluso", "Calendário e contatos sincronizados", "Suporte prioritário"],
    ideal: "Quem atende hotéis e empresas",
    highlight: true,
  },
  {
    id: "frota",
    name: "Frota",
    icon: Users,
    price: "49,90",
    features: ["Até 5 contas de e-mail", "30 GB cada conta", "Domínio incluso", "Gestão centralizada"],
    ideal: "Quem tem equipe",
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

export default function EmailBusiness() {
  const [step, setStep] = useState(0); // 0=landing, 1=dominio, 2=plano, 3=conta, 4=confirmacao
  const [domainOption, setDomainOption] = useState<"novo" | "existente" | "">("");
  const [domain, setDomain] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nomeEmail, setNomeEmail] = useState("contato");
  const [senha, setSenha] = useState("");
  const { toast } = useToast();

  const emailPreview = domain ? `${nomeEmail}@${domain}` : `${nomeEmail}@suaempresa.com.br`;

  const handleFinish = () => {
    toast({ title: "Solicitação enviada!", description: "Sua conta de e-mail profissional será ativada em breve." });
    setStep(0);
    setDomainOption("");
    setDomain("");
    setSelectedPlan("");
    setNomeCompleto("");
    setNomeEmpresa("");
    setNomeEmail("contato");
    setSenha("");
  };

  // Landing page
  if (step === 0) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Mail className="h-4 w-4" />
            E-mail Business
          </div>
          <h1 className="text-3xl font-bold text-foreground">Seu e-mail profissional para fechar mais corridas</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pare de usar Gmail comum. Tenha um e-mail com o nome da sua empresa e passe autoridade para hotéis, empresas e clientes executivos.
          </p>
        </div>

        {/* Example */}
        <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Exemplo:</p>
            <p className="text-xl font-mono font-bold text-primary">contato@transporteexecutivo.com.br</p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Persuasive text */}
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
          <h2 className="text-xl font-bold text-center text-foreground mb-4">Escolha seu plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card key={plan.id} className={cn("relative transition-all hover:shadow-md", plan.highlight && "border-primary ring-1 ring-primary")}>
                {plan.highlight && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Mais vendido</Badge>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <plan.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">R$ {plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">Ideal para: {plan.ideal}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => setStep(1)} className="gap-2">
            <Mail className="h-4 w-4" />
            Criar Meu E-mail Profissional
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Wizard steps
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Domínio", "Plano", "Conta", "Confirmação"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0",
              i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-xs hidden sm:inline", i + 1 <= step ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
            {i < 3 && <div className={cn("flex-1 h-0.5", i + 1 < step ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Domain */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              Escolha seu domínio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Você já tem um domínio?</Label>
              <Select value={domainOption} onValueChange={(v) => setDomainOption(v as "novo" | "existente")}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Quero registrar um novo domínio</SelectItem>
                  <SelectItem value="existente">Já tenho um domínio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {domainOption && (
              <div className="space-y-2">
                <Label>{domainOption === "novo" ? "Nome desejado para o domínio" : "Informe seu domínio"}</Label>
                <Input placeholder="suaempresa.com.br" value={domain} onChange={(e) => setDomain(e.target.value)} />
                {domainOption === "existente" && (
                  <p className="text-xs text-muted-foreground">Será necessário apontar o DNS para ativação.</p>
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

      {/* Step 2: Plan */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-primary" />
              Escolha seu plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                  selectedPlan === plan.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <plan.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.ideal}</p>
                  </div>
                </div>
                <span className="font-bold text-foreground">R$ {plan.price}/mês</span>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button disabled={!selectedPlan} onClick={() => setStep(3)}>Próximo<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Account */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Criar conta de e-mail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Felipe da Silva" />
              </div>
              <div className="space-y-2">
                <Label>Nome da empresa</Label>
                <Input value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} placeholder="Executivo Balneário" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do e-mail</Label>
              <div className="flex items-center gap-1">
                <Input value={nomeEmail} onChange={(e) => setNomeEmail(e.target.value)} placeholder="contato" className="max-w-[180px]" />
                <span className="text-sm text-muted-foreground">@{domain || "suaempresa.com.br"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Sugestões: contato, reservas, financeiro</p>
            </div>
            <div className="space-y-2">
              <Label>Senha do e-mail</Label>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>

            {/* Preview */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Seu e-mail será:</p>
                <p className="text-lg font-mono font-bold text-primary">{emailPreview}</p>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button disabled={!nomeCompleto || !nomeEmpresa || !nomeEmail || senha.length < 8} onClick={() => setStep(4)}>
                Próximo<ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Confirme sua solicitação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Domínio</span>
                <span className="font-medium text-foreground">{domain}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Plano</span>
                <span className="font-medium text-foreground">{PLANS.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-bold text-foreground">R$ {PLANS.find(p => p.id === selectedPlan)?.price}/mês</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">E-mail</span>
                <span className="font-mono font-medium text-primary">{emailPreview}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Responsável</span>
                <span className="font-medium text-foreground">{nomeCompleto}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
              <Button onClick={handleFinish} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Confirmar e Ativar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
