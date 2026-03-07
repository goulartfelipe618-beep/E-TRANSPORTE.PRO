import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MessageSquare, Loader2 } from "lucide-react";

interface Comunicador {
  id: string;
  nome: string;
  webhook_url: string;
  descricao: string | null;
  ativo: boolean;
}

interface MasterComunicarDialogProps {
  open: boolean;
  onClose: () => void;
  payload: Record<string, unknown>;
  titulo?: string;
}

const LABEL_MAP: Record<string, string> = {
  tipo: "Tipo", id: "ID", tipo_viagem: "Tipo de Viagem",
  cliente_nome: "Nome do Cliente", cliente_telefone: "Telefone do Cliente",
  cliente_email: "E-mail do Cliente", cliente_origem: "Origem do Cliente",
  cliente_cpf_cnpj: "CPF/CNPJ do Cliente", cliente_whatsapp: "WhatsApp do Cliente",
  embarque: "Local de Embarque", destino: "Local de Destino",
  data: "Data", hora: "Hora", status: "Status",
  motorista_nome: "Nome do Motorista", motorista_telefone: "Telefone do Motorista",
  veiculo: "Veículo", valor_total: "Valor Total", valor_base: "Valor Base",
  desconto_percentual: "Desconto (%)", metodo_pagamento: "Método de Pagamento",
  observacoes: "Observações", nome: "Nome Completo", nome_completo: "Nome Completo",
  cpf: "CPF", telefone: "Telefone", email: "E-mail", cidade: "Cidade", estado: "Estado",
  cnh_categoria: "Categoria CNH", cnh_numero: "Número CNH",
  possui_veiculo: "Possui Veículo", experiencia: "Experiência", mensagem: "Mensagem",
  razao_social: "Razão Social", nome_fantasia: "Nome Fantasia", cnpj: "CNPJ",
  whatsapp: "WhatsApp", responsavel_nome: "Nome do Responsável",
  responsavel_telefone: "Telefone do Responsável", campanha: "Campanha",
  valor_venda: "Valor da Venda", data_conversao: "Data de Conversão",
  endereco: "Endereço", cep: "CEP", rg: "RG",
  dominio: "Domínio", plano: "Plano", valor: "Valor",
  nome_empresa: "Nome da Empresa", nome_projeto: "Nome do Projeto",
  telefone_whatsapp: "Telefone WhatsApp", instance_name: "Instância",
  tenant_name: "Tenant", tenant: "Tenant",
  ddd: "DDD", uf: "UF", numero: "Número", complemento: "Complemento",
  ramal: "Ramal", aceite_contrato: "Aceite Contrato",
  ida_embarque: "Embarque (Ida)", ida_destino: "Destino (Ida)",
  ida_data: "Data (Ida)", ida_hora: "Hora (Ida)",
  volta_embarque: "Embarque (Volta)", volta_destino: "Destino (Volta)",
  volta_data: "Data (Volta)", volta_hora: "Hora (Volta)",
  numero_passageiros: "Passageiros", data_ida: "Data Ida", data_retorno: "Data Retorno",
  hora_ida: "Hora Ida", hora_retorno: "Hora Retorno", endereco_embarque: "Embarque",
  tipo_veiculo: "Tipo Veículo", cupom: "Cupom", codigo: "Código",
  cidade_atuacao: "Cidade de Atuação", regiao_atendida: "Região Atendida",
  frota: "Frota", email_profissional: "E-mail Profissional",
  diferenciais: "Diferenciais", estilo_desejado: "Estilo",
  cores_preferidas: "Cores Preferidas", faixa_preco: "Faixa de Preço",
  categoria_principal: "Categoria Principal", verificacao: "Verificação",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getLabel(key: string): string {
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MasterComunicarDialog({ open, onClose, payload, titulo }: MasterComunicarDialogProps) {
  const [comunicadores, setComunicadores] = useState<Comunicador[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saudacao, setSaudacao] = useState("Olá, segue informação sobre sua solicitação:");
  const [mensagem, setMensagem] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const payloadEntries = useMemo(() => {
    return Object.entries(payload)
      .filter(([k, v]) => v !== null && v !== undefined && v !== "" && k !== "id" && k !== "user_id" && k !== "tenant_id" && k !== "created_at" && k !== "updated_at")
      .map(([key, value]) => ({ key, label: getLabel(key), value: formatValue(value) }));
  }, [payload]);

  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    setMensagem("");
    setSaudacao("Olá, segue informação sobre sua solicitação:");
    setSelectedFields(new Set(payloadEntries.map((e) => e.key)));
    setLoading(true);
    // Fetch master comunicadores (tenant_id IS NULL)
    supabase
      .from("comunicadores")
      .select("*")
      .eq("ativo", true)
      .is("tenant_id", null)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComunicadores(data || []);
        setLoading(false);
      });
  }, [open, payloadEntries]);

  const toggleField = (key: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedFields.size === payloadEntries.length) setSelectedFields(new Set());
    else setSelectedFields(new Set(payloadEntries.map((e) => e.key)));
  };

  const formattedMessage = useMemo(() => {
    const lines = payloadEntries
      .filter((e) => selectedFields.has(e.key))
      .map((e) => `*${e.label}:* ${e.value}`);
    const parts: string[] = [];
    if (saudacao.trim()) parts.push(saudacao.trim());
    if (lines.length > 0) parts.push("\n" + lines.join("\n"));
    if (mensagem.trim()) parts.push("\n" + mensagem.trim());
    return parts.join("\n");
  }, [payloadEntries, selectedFields, saudacao, mensagem]);

  const handleSend = async () => {
    if (!selectedId) { toast.error("Selecione um comunicador"); return; }
    const comunicador = comunicadores.find((c) => c.id === selectedId);
    if (!comunicador) return;

    setSending(true);
    try {
      const selectedPayload: Record<string, unknown> = {};
      payloadEntries
        .filter((e) => selectedFields.has(e.key))
        .forEach((e) => { selectedPayload[e.key] = payload[e.key]; });

      const body: Record<string, unknown> = {
        ...selectedPayload,
        mensagem_formatada: formattedMessage,
        mensagem_adicional: mensagem || null,
        comunicador_nome: comunicador.nome,
      };

      const res = await fetch(comunicador.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Comunicação enviada com sucesso!");
      onClose();
    } catch (err: any) {
      toast.error(`Erro ao enviar: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Comunicar
          </DialogTitle>
          <DialogDescription>
            {titulo || "Envie os dados para o comunicador selecionado"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Selecione o Comunicador</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : comunicadores.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum comunicador ativo. Configure no menu Comunicador.
              </p>
            ) : (
              <div className="space-y-2">
                {comunicadores.map((c) => (
                  <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left border rounded-lg p-3 transition-colors ${selectedId === c.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">{c.nome}</span>
                      <Badge variant="default" className="text-xs">Ativo</Badge>
                    </div>
                    {c.descricao && <p className="text-xs text-muted-foreground mt-1">{c.descricao}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mensagem de Saudação</Label>
            <Textarea placeholder="Ex: Olá, segue informação..." value={saudacao} onChange={(e) => setSaudacao(e.target.value)} rows={2} />
          </div>

          {payloadEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Dados a enviar</Label>
                <button type="button" onClick={toggleAll} className="text-xs text-primary hover:underline">
                  {selectedFields.size === payloadEntries.length ? "Desmarcar todos" : "Selecionar todos"}
                </button>
              </div>
              <ScrollArea className="max-h-[40vh] border border-border rounded-lg p-3">
                <div className="space-y-2">
                  {payloadEntries.map((entry) => (
                    <label key={entry.key} className="flex items-start gap-2 cursor-pointer text-sm">
                      <Checkbox checked={selectedFields.has(entry.key)} onCheckedChange={() => toggleField(entry.key)} className="mt-0.5" />
                      <span className="flex-1">
                        <span className="font-semibold text-foreground">{entry.label}:</span>{" "}
                        <span className="text-muted-foreground">{entry.value}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="space-y-2">
            <Label>Mensagem Adicional (opcional)</Label>
            <Textarea placeholder="Digite uma mensagem que será enviada após os dados..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Pré-visualização da Mensagem</Label>
            <div className="border border-border rounded-lg p-3 bg-muted/30 text-xs whitespace-pre-wrap font-mono max-h-40 overflow-y-auto text-foreground">
              {formattedMessage || <span className="text-muted-foreground italic">Nenhum dado selecionado</span>}
            </div>
          </div>

          <Button className="w-full" onClick={handleSend} disabled={sending || !selectedId}>
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar Comunicação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
