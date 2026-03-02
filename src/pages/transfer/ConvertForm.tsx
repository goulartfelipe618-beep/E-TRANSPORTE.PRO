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

type SolicitacaoRow = Tables<"solicitacoes_transfer">;

interface ConvertFormProps {
  solicitacao: SolicitacaoRow | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, any>) => void;
  loading?: boolean;
}

export default function ConvertForm({ solicitacao, open, onClose, onConfirm, loading }: ConvertFormProps) {
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (solicitacao) {
      setForm({
        tipo_viagem: solicitacao.tipo_viagem,
        cliente_nome: solicitacao.cliente_nome || "",
        cliente_cpf_cnpj: "",
        cliente_email: solicitacao.cliente_email || "",
        cliente_telefone: solicitacao.cliente_telefone || "",
        cliente_origem: solicitacao.cliente_origem || "",
        // Ida
        ida_passageiros: solicitacao.ida_passageiros ?? "",
        ida_embarque: solicitacao.ida_embarque || "",
        ida_destino: solicitacao.ida_destino || "",
        ida_data: solicitacao.ida_data || "",
        ida_hora: solicitacao.ida_hora || "",
        ida_mensagem: solicitacao.ida_mensagem || "",
        ida_cupom: solicitacao.ida_cupom || "",
        // Volta
        volta_passageiros: solicitacao.volta_passageiros ?? "",
        volta_embarque: solicitacao.volta_embarque || "",
        volta_destino: solicitacao.volta_destino || "",
        volta_data: solicitacao.volta_data || "",
        volta_hora: solicitacao.volta_hora || "",
        volta_mensagem: solicitacao.volta_mensagem || "",
        volta_cupom: solicitacao.volta_cupom || "",
        // Por Hora
        por_hora_passageiros: solicitacao.por_hora_passageiros ?? "",
        por_hora_endereco_inicio: solicitacao.por_hora_endereco_inicio || "",
        por_hora_data: solicitacao.por_hora_data || "",
        por_hora_hora: solicitacao.por_hora_hora || "",
        por_hora_qtd_horas: solicitacao.por_hora_qtd_horas ?? "",
        por_hora_ponto_encerramento: solicitacao.por_hora_ponto_encerramento || "",
        por_hora_itinerario: solicitacao.por_hora_itinerario || "",
        por_hora_cupom: solicitacao.por_hora_cupom || "",
        // Veículo / Motorista
        veiculo: "",
        motorista_nome: "",
        motorista_telefone: "",
        // Valores
        valor_base: 0,
        desconto_percentual: 0,
        metodo_pagamento: "",
        // Observações
        observacoes: "",
      });
    }
  }, [solicitacao]);

  const set = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const valorTotal = useMemo(() => {
    const base = Number(form.valor_base) || 0;
    const desc = Number(form.desconto_percentual) || 0;
    return base - (base * desc / 100);
  }, [form.valor_base, form.desconto_percentual]);

  const tipoMap: Record<string, string> = {
    somente_ida: "Somente Ida",
    ida_e_volta: "Ida e Volta",
    por_hora: "Por Hora",
  };

  const tipo = form.tipo_viagem;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converter em Reserva</DialogTitle>
          <DialogDescription>
            Revise os dados, preencha informações adicionais e confirme. Tipo: {tipoMap[tipo] || tipo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ── Informações do Cliente ── */}
          <fieldset className="space-y-3">
            <legend className="font-semibold text-foreground text-sm">Informações do Cliente</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome Completo *" value={form.cliente_nome} onChange={(v) => set("cliente_nome", v)} />
              <Field label="CPF/CNPJ *" value={form.cliente_cpf_cnpj} onChange={(v) => set("cliente_cpf_cnpj", v)} placeholder="000.000.000-00" />
              <Field label="Email *" value={form.cliente_email} onChange={(v) => set("cliente_email", v)} type="email" />
              <Field label="Telefone *" value={form.cliente_telefone} onChange={(v) => set("cliente_telefone", v)} />
            </div>
          </fieldset>

          {/* ── Detalhes da Viagem ── */}
          <fieldset className="space-y-3 border-t pt-4">
            <legend className="font-semibold text-foreground text-sm">Detalhes da Viagem</legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Viagem *</Label>
                <Select value={form.tipo_viagem || ""} onValueChange={(v) => set("tipo_viagem", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="somente_ida">Somente Ida</SelectItem>
                    <SelectItem value="ida_e_volta">Ida e Volta</SelectItem>
                    <SelectItem value="por_hora">Por Hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ida */}
            {(tipo === "somente_ida" || tipo === "ida_e_volta") && (
              <div className="space-y-3 border rounded-md p-3 bg-muted/30">
                <p className="text-xs font-semibold text-foreground">→ Ida</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Local de Embarque (IDA) *" value={form.ida_embarque} onChange={(v) => set("ida_embarque", v)} />
                  <Field label="Local de Desembarque (IDA) *" value={form.ida_destino} onChange={(v) => set("ida_destino", v)} />
                  <Field label="Data/Hora do Embarque (IDA) *" value={form.ida_data} onChange={(v) => set("ida_data", v)} type="date" />
                  <Field label="Hora" value={form.ida_hora} onChange={(v) => set("ida_hora", v)} type="time" />
                  <Field label="Número de Passageiros *" value={form.ida_passageiros} onChange={(v) => set("ida_passageiros", v)} type="number" />
                  <Field label="Cupom" value={form.ida_cupom} onChange={(v) => set("ida_cupom", v)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mensagem / Observações</Label>
                  <Textarea value={form.ida_mensagem} onChange={(e) => set("ida_mensagem", e.target.value)} rows={2} />
                </div>
              </div>
            )}

            {/* Volta */}
            {tipo === "ida_e_volta" && (
              <div className="space-y-3 border rounded-md p-3 bg-muted/30">
                <p className="text-xs font-semibold text-foreground">⇆ Volta</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Local de Embarque (Volta)" value={form.volta_embarque} onChange={(v) => set("volta_embarque", v)} />
                  <Field label="Local de Desembarque (Volta)" value={form.volta_destino} onChange={(v) => set("volta_destino", v)} />
                  <Field label="Data" value={form.volta_data} onChange={(v) => set("volta_data", v)} type="date" />
                  <Field label="Hora" value={form.volta_hora} onChange={(v) => set("volta_hora", v)} type="time" />
                  <Field label="Passageiros" value={form.volta_passageiros} onChange={(v) => set("volta_passageiros", v)} type="number" />
                  <Field label="Cupom" value={form.volta_cupom} onChange={(v) => set("volta_cupom", v)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mensagem / Observações</Label>
                  <Textarea value={form.volta_mensagem} onChange={(e) => set("volta_mensagem", e.target.value)} rows={2} />
                </div>
              </div>
            )}

            {/* Por Hora */}
            {tipo === "por_hora" && (
              <div className="space-y-3 border rounded-md p-3 bg-muted/30">
                <p className="text-xs font-semibold text-foreground">⏱ Por Hora</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Endereço de Início" value={form.por_hora_endereco_inicio} onChange={(v) => set("por_hora_endereco_inicio", v)} />
                  <Field label="Ponto de Encerramento" value={form.por_hora_ponto_encerramento} onChange={(v) => set("por_hora_ponto_encerramento", v)} />
                  <Field label="Data" value={form.por_hora_data} onChange={(v) => set("por_hora_data", v)} type="date" />
                  <Field label="Hora" value={form.por_hora_hora} onChange={(v) => set("por_hora_hora", v)} type="time" />
                  <Field label="Passageiros" value={form.por_hora_passageiros} onChange={(v) => set("por_hora_passageiros", v)} type="number" />
                  <Field label="Qtd. Horas" value={form.por_hora_qtd_horas} onChange={(v) => set("por_hora_qtd_horas", v)} type="number" />
                  <Field label="Cupom" value={form.por_hora_cupom} onChange={(v) => set("por_hora_cupom", v)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Itinerário / Observações</Label>
                  <Textarea value={form.por_hora_itinerario} onChange={(e) => set("por_hora_itinerario", e.target.value)} rows={2} />
                </div>
              </div>
            )}
          </fieldset>

          {/* ── Veículo e Motorista ── */}
          <fieldset className="space-y-3 border-t pt-4">
            <legend className="font-semibold text-foreground text-sm">Veículo e Motorista</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Veículo" value={form.veiculo} onChange={(v) => set("veiculo", v)} placeholder="Selecione um veículo" />
              <Field label="Nome do Motorista" value={form.motorista_nome} onChange={(v) => set("motorista_nome", v)} />
              <Field label="Telefone do Motorista" value={form.motorista_telefone} onChange={(v) => set("motorista_telefone", v)} />
            </div>
          </fieldset>

          {/* ── Valores e Pagamento ── */}
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

          {/* ── Observações ── */}
          <fieldset className="space-y-2 border-t pt-4">
            <legend className="font-semibold text-foreground text-sm">Observações</legend>
            <Textarea
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              rows={3}
              placeholder="Observações adicionais sobre a reserva..."
            />
          </fieldset>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm({ ...form, valor_total: valorTotal })} disabled={loading}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {loading ? "Convertendo..." : "Confirmar Reserva"}
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
