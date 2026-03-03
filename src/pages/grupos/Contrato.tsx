import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_TERMOS = `1. DO OBJETO
1.1. O presente contrato tem por objeto a prestação de serviço de transporte de grupos com ônibus, micro-ônibus ou vans.
1.2. O CONTRATANTE declara ter conhecimento de todas as condições do serviço contratado.

2. DO SERVIÇO
2.1. O serviço de transporte de grupo será realizado conforme trajeto, data e horário especificados neste instrumento.
2.2. O veículo será disponibilizado com motorista profissional habilitado.
2.3. O serviço inclui busca e transporte do grupo até o destino indicado.

3. DO VALOR
3.1. O valor do serviço será aquele especificado neste contrato.
3.2. O pagamento deverá ser efetuado na forma acordada entre as partes.

4. DAS RESPONSABILIDADES DO CONTRATANTE
4.1. Garantir que todos os passageiros estejam no local de embarque no horário combinado.
4.2. Informar com antecedência eventuais alterações no trajeto ou horário.
4.3. Zelar pela conservação do veículo durante o trajeto.`;

const DEFAULT_CANCELAMENTO = `POLÍTICA DE CANCELAMENTO

- Cancelamentos com mais de 72 horas de antecedência: reembolso integral.
- Cancelamentos entre 48 e 72 horas: reembolso de 50%.
- Cancelamentos com menos de 48 horas: sem reembolso.
- No-show (não comparecimento): sem reembolso.

A empresa reserva-se o direito de cancelar o serviço em casos de força maior, oferecendo reagendamento ou reembolso integral.`;

const DEFAULT_CLAUSULAS = `CLÁUSULAS ADICIONAIS

8.1. Este contrato é regido pelas leis da República Federativa do Brasil.
8.2. Fica eleito o foro da comarca local para dirimir quaisquer dúvidas oriundas deste contrato.
8.3. As partes declaram ter lido e concordado com todos os termos deste contrato.
8.4. Alterações de trajeto durante o serviço poderão acarretar cobrança adicional.
8.5. É proibido o consumo de bebidas alcoólicas e alimentos que possam danificar o veículo.`;

export default function GruposContrato() {
  const { settings, isLoading, upsert } = useSystemSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCnpj, setEmpresaCnpj] = useState("");
  const [empresaEndereco, setEmpresaEndereco] = useState("");
  const [termos, setTermos] = useState(DEFAULT_TERMOS);
  const [cancelamento, setCancelamento] = useState(DEFAULT_CANCELAMENTO);
  const [clausulas, setClausulas] = useState(DEFAULT_CLAUSULAS);

  useEffect(() => {
    if (!isLoading) {
      setEmpresaNome(settings["grupo_contrato_empresa_nome"] || settings["contrato_empresa_nome"] || "");
      setEmpresaCnpj(settings["grupo_contrato_empresa_cnpj"] || settings["contrato_empresa_cnpj"] || "");
      setEmpresaEndereco(settings["grupo_contrato_empresa_endereco"] || settings["contrato_empresa_endereco"] || "");
      if (settings["grupo_contrato_termos"]) setTermos(settings["grupo_contrato_termos"]);
      if (settings["grupo_contrato_cancelamento"]) setCancelamento(settings["grupo_contrato_cancelamento"]);
      if (settings["grupo_contrato_clausulas"]) setClausulas(settings["grupo_contrato_clausulas"]);
    }
  }, [isLoading, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        upsert.mutateAsync({ key: "grupo_contrato_empresa_nome", value: empresaNome }),
        upsert.mutateAsync({ key: "grupo_contrato_empresa_cnpj", value: empresaCnpj }),
        upsert.mutateAsync({ key: "grupo_contrato_empresa_endereco", value: empresaEndereco }),
        upsert.mutateAsync({ key: "grupo_contrato_termos", value: termos }),
        upsert.mutateAsync({ key: "grupo_contrato_cancelamento", value: cancelamento }),
        upsert.mutateAsync({ key: "grupo_contrato_clausulas", value: clausulas }),
      ]);
      toast({ title: "Contrato de grupos salvo com sucesso" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setSaving(false);
  };

  if (isLoading) return <p className="text-muted-foreground p-4">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileText className="h-8 w-8 text-primary mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contrato de Grupos</h1>
            <p className="text-muted-foreground">Configure o modelo de contrato para reservas de transporte de grupos</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>Informações que aparecerão no cabeçalho do contrato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} placeholder="Razão Social" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={empresaCnpj} onChange={(e) => setEmpresaCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço Completo</Label>
            <Input value={empresaEndereco} onChange={(e) => setEmpresaEndereco(e.target.value)} placeholder="Rua, número, bairro, CEP, cidade/UF" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termos Gerais</CardTitle>
          <CardDescription>Cláusulas principais do contrato de transporte de grupos</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={termos} onChange={(e) => setTermos(e.target.value)} className="min-h-[280px] font-mono text-sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Política de Cancelamento</CardTitle>
          <CardDescription>Regras para cancelamento e reembolso do serviço de grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={cancelamento} onChange={(e) => setCancelamento(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cláusulas Adicionais</CardTitle>
          <CardDescription>Disposições finais e informações complementares</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={clausulas} onChange={(e) => setClausulas(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        </CardContent>
      </Card>
    </div>
  );
}
