import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/useTenantId";

const UF_LIST = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

interface Props {
  domain: string;
  plan: { id: string; label: string; price: number };
  onBack: () => void;
  onSuccess: () => void;
}

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(cleaned[10]);
}

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export default function DomainRegistrationForm({ domain, plan, onBack, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const tenantId = useTenantId();

  // Step 1 - CPF
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState("");

  // Step 2 - Personal data
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [ddd, setDdd] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ramal, setRamal] = useState("");

  // Step 3 - Accept
  const [aceite, setAceite] = useState(false);

  const handleCpfNext = () => {
    const cleaned = cpf.replace(/\D/g, "");
    if (!validateCPF(cleaned)) {
      setCpfError("CPF inválido. Informe um CPF válido.");
      return;
    }
    setCpfError("");
    setStep(2);
  };

  const handleDataNext = () => {
    if (!nome.trim() || !email.trim() || !cep.trim() || !endereco.trim() || !numero.trim() || !uf || !cidade.trim() || !ddd.trim() || !telefone.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido.");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!aceite) { toast.error("Você precisa aceitar o contrato para continuar."); return; }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sessão expirada. Faça login novamente."); return; }

      const { error } = await supabase.from("solicitacoes_dominio" as any).insert({
        tenant_id: tenantId,
        user_id: user.id,
        dominio: domain,
        plano: plan.label,
        valor: plan.price,
        cpf: cpf.replace(/\D/g, ""),
        nome_completo: nome.trim(),
        email: email.trim(),
        cep: cep.replace(/\D/g, ""),
        endereco: endereco.trim(),
        numero: numero.trim(),
        complemento: complemento.trim() || null,
        uf,
        cidade: cidade.trim(),
        ddd: ddd.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        ramal: ramal.trim() || null,
        aceite_contrato: true,
        status: "em_analise",
      } as any);

      if (error) { toast.error("Erro ao enviar solicitação."); console.error(error); return; }
      toast.success("Solicitação enviada com sucesso!");
      onSuccess();
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={step === 1 ? onBack : () => setStep(step - 1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Registro de Domínio</h1>
          <p className="text-sm text-muted-foreground">{domain} — {plan.label} (R$ {plan.price.toFixed(2).replace(".", ",")})</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* Step 1 - CPF */}
      {step === 1 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Etapa 1 — CPF do Titular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => { setCpf(formatCPF(e.target.value)); setCpfError(""); }}
                maxLength={14}
              />
              {cpfError && <p className="text-sm text-destructive">{cpfError}</p>}
            </div>
            <Button onClick={handleCpfNext} className="w-full gap-2">
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Personal Data */}
      {step === 2 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Etapa 2 — Dados do Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CEP *</Label>
                <Input value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="00000000" />
              </div>
              <div className="space-y-2">
                <Label>UF *</Label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {UF_LIST.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cidade *</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Sua cidade" />
            </div>
            <div className="space-y-2">
              <Label>Endereço *</Label>
              <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, Avenida..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Número *</Label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, Sala..." />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>DDD *</Label>
                <Input value={ddd} onChange={(e) => setDdd(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="11" />
              </div>
              <div className="space-y-2">
                <Label>Telefone *</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="999999999" />
              </div>
              <div className="space-y-2">
                <Label>Ramal</Label>
                <Input value={ramal} onChange={(e) => setRamal(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <Button onClick={handleDataNext} className="w-full gap-2">
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Confirmation */}
      {step === 3 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Etapa 3 — Confirmação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Domínio:</span><span className="font-medium text-foreground">{domain}</span>
                <span className="text-muted-foreground">Plano:</span><span className="font-medium text-foreground">{plan.label}</span>
                <span className="text-muted-foreground">Valor:</span><span className="font-medium text-foreground">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                <span className="text-muted-foreground">CPF:</span><span className="font-medium text-foreground">{cpf}</span>
                <span className="text-muted-foreground">Nome:</span><span className="font-medium text-foreground">{nome}</span>
                <span className="text-muted-foreground">E-mail:</span><span className="font-medium text-foreground">{email}</span>
                <span className="text-muted-foreground">Cidade:</span><span className="font-medium text-foreground">{cidade}/{uf}</span>
                <span className="text-muted-foreground">Telefone:</span><span className="font-medium text-foreground">({ddd}) {telefone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Checkbox
                id="aceite"
                checked={aceite}
                onCheckedChange={(c) => setAceite(c === true)}
              />
              <label htmlFor="aceite" className="text-sm text-foreground leading-snug cursor-pointer">
                Li e aceito todos os itens do contrato, estando ciente da política de privacidade.
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={!aceite || submitting} className="w-full gap-2" size="lg">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enviar Solicitação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
