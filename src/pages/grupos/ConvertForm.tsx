import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type SolicitacaoGrupoRow = Tables<"solicitacoes_grupos">;

interface ConvertFormProps {
  solicitacao?: SolicitacaoGrupoRow | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, any>) => void;
  loading?: boolean;
  mode?: "convert" | "create";
}

export default function GruposConvertForm({ solicitacao, open, onClose, onConfirm, loading, mode = "convert" }: ConvertFormProps) {
  const [form, setForm] = useState<Record<string, any>>({});

  const emptyForm = {
    tipo_veiculo: "",
    numero_passageiros: "",
    endereco_embarque: "",
    destino: "",
    data_ida: "",
    hora_ida: "",
    data_retorno: "",
    hora_retorno: "",
    observacoes: "",
    cupom: "",
    cliente_nome: "",
    cliente_cpf_cnpj: "",
    cliente_email: "",
    cliente_whatsapp: "",
    cliente_origem: "",
    veiculo: "",
    motorista_nome: "",
    motorista_telefone: "",
    valor_base: 0,
    desconto_percentual: 0,
    metodo_pagamento: "",
  };

  useEffect(() => {
    if (mode === "create") {
      setForm(emptyForm);
    } else if (solicitacao) {
      setForm({
        tipo_veiculo: solicitacao.tipo_veiculo || "",
        numero_passageiros: solicitacao.numero_passageiros ?? "",
        endereco_embarque: solicitacao.endereco_embarque || "",
        destino: solicitacao.destino || "",
        data_ida: solicitacao.data_ida || "",
        hora_ida: solicitacao.hora_ida || "",
        data_retorno: solicitacao.data_retorno || "",
        hora_retorno: solicitacao.hora_retorno || "",
        observacoes: solicitacao.observacoes || "",
        cupom: solicitacao.cupom || "",
        cliente_nome: solicitacao.cliente_nome || "",
        cliente_cpf_cnpj: "",
        cliente_email: solicitacao.cliente_email || "",
        cliente_whatsapp: solicitacao.cliente_whatsapp || "",
        cliente_origem: solicitacao.cliente_origem || "",
        veiculo: "",
        motorista_nome: "",
        motorista_telefone: "",
        valor_base: 0,
        desconto_percentual: 0,
        metodo_pagamento: "",
      });
    }
  }, [solicitacao, mode, open]);

  const set = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const valorTotal = useMemo(() => {
    const base = Number(form.valor_base) || 0;
    const desc = Number(form.desconto_percentual) || 0;
    return base - (base * desc / 100);
  }, [form.valor_base, form.desconto_percentual]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Criar Nova Reserva de Grupo" : "Converter em Reserva de Grupo"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Preencha os dados para criar uma nova reserva de grupo." : "Revise os dados, preencha informações adicionais e confirme."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <fieldset className="space-y-3">
            <legend className="font-semibold text-foreground text-sm">Informações do Cliente</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome Completo *" value={form.cliente_nome} onChange={(v) => set("cliente_nome", v)} />
              <Field label="CPF/CNPJ *" value={form.cliente_cpf_cnpj} onChange={(v) => set("cliente_cpf_cnpj", v)} placeholder="000.000.000-00" />
              <Field label="Email *" value={form.cliente_email} onChange={(v) => set("cliente_email", v)} type="email" />
              <Field label="WhatsApp *" value={form.cliente_whatsapp} onChange={(v) => set("cliente_whatsapp", v)} />
            </div>
          </fieldset>

          {/* Detalhes da Viagem */}
          <fieldset className="space-y-3 border-t pt-4">
            <legend className="font-semibold text-foreground text-sm">Detalhes da Viagem</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Veículo *</Label>
                <Select value={form.tipo_veiculo || ""} onValueChange={(v) => set("tipo_veiculo", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onibus">Ônibus</SelectItem>
                    <SelectItem value="micro_onibus">Micro-ônibus</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Número de Passageiros *" value={form.numero_passageiros} onChange={(v) => set("numero_passageiros", v)} type="number" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AddressField label="Endereço de Embarque *" value={form.endereco_embarque} onChange={(v) => set("endereco_embarque", v)} />
              <AddressField label="Destino *" value={form.destino} onChange={(v) => set("destino", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Data de Ida *" value={form.data_ida} onChange={(v) => set("data_ida", v)} type="date" />
              <Field label="Hora de Ida *" value={form.hora_ida} onChange={(v) => set("hora_ida", v)} type="time" />
              <Field label="Data de Retorno (opcional)" value={form.data_retorno} onChange={(v) => set("data_retorno", v)} type="date" />
              <Field label="Hora de Retorno (opcional)" value={form.hora_retorno} onChange={(v) => set("hora_retorno", v)} type="time" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Cupom de Desconto" value={form.cupom} onChange={(v) => set("cupom", v)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3} placeholder="Detalhes sobre a excursão, itinerário, necessidades especiais..." />
            </div>
          </fieldset>

          {/* Veículo e Motorista */}
          <fieldset className="space-y-3 border-t pt-4">
            <legend className="font-semibold text-foreground text-sm">Veículo e Motorista</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Veículo" value={form.veiculo} onChange={(v) => set("veiculo", v)} placeholder="Selecione um veículo" />
              <Field label="Nome do Motorista" value={form.motorista_nome} onChange={(v) => set("motorista_nome", v)} />
              <Field label="Telefone do Motorista" value={form.motorista_telefone} onChange={(v) => set("motorista_telefone", v)} />
            </div>
          </fieldset>

          {/* Valores e Pagamento */}
          <fieldset className="space-y-3 border-t pt-4">
            <legend className="font-semibold text-foreground text-sm">Valores e Pagamento</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Valor Base *" value={form.valor_base} onChange={(v) => set("valor_base", v)} type="number" />
              <Field label="Desconto (%)" value={form.desconto_percentual} onChange={(v) => set("desconto_percentual", v)} type="number" />
              <Field label="Método de Pagamento" value={form.metodo_pagamento} onChange={(v) => set("metodo_pagamento", v)} placeholder="Ex: Dinheiro, Cartão, PIX" />
            </div>
            <div className="bg-muted rounded-md px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
              <span className="text-lg font-bold text-foreground">
                R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </fieldset>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm({ ...form, valor_total: valorTotal })} disabled={loading}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : mode === "create" ? "Criar Reserva" : "Confirmar Reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function AddressField({ label, value, onChange }: {
  label: string; value: any; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <AddressAutocomplete value={value ?? ""} onChange={onChange} placeholder="Digite o endereço..." />
    </div>
  );
}
