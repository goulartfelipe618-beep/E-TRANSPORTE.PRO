import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        cliente_telefone: solicitacao.cliente_telefone || "",
        cliente_email: solicitacao.cliente_email || "",
        cliente_origem: solicitacao.cliente_origem || "",
        ida_passageiros: solicitacao.ida_passageiros ?? "",
        ida_embarque: solicitacao.ida_embarque || "",
        ida_destino: solicitacao.ida_destino || "",
        ida_data: solicitacao.ida_data || "",
        ida_hora: solicitacao.ida_hora || "",
        ida_mensagem: solicitacao.ida_mensagem || "",
        ida_cupom: solicitacao.ida_cupom || "",
        volta_passageiros: solicitacao.volta_passageiros ?? "",
        volta_embarque: solicitacao.volta_embarque || "",
        volta_destino: solicitacao.volta_destino || "",
        volta_data: solicitacao.volta_data || "",
        volta_hora: solicitacao.volta_hora || "",
        volta_mensagem: solicitacao.volta_mensagem || "",
        volta_cupom: solicitacao.volta_cupom || "",
        por_hora_passageiros: solicitacao.por_hora_passageiros ?? "",
        por_hora_endereco_inicio: solicitacao.por_hora_endereco_inicio || "",
        por_hora_data: solicitacao.por_hora_data || "",
        por_hora_hora: solicitacao.por_hora_hora || "",
        por_hora_qtd_horas: solicitacao.por_hora_qtd_horas ?? "",
        por_hora_ponto_encerramento: solicitacao.por_hora_ponto_encerramento || "",
        por_hora_itinerario: solicitacao.por_hora_itinerario || "",
        por_hora_cupom: solicitacao.por_hora_cupom || "",
      });
    }
  }, [solicitacao]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const tipoMap: Record<string, string> = {
    somente_ida: "Somente Ida",
    ida_e_volta: "Ida e Volta",
    por_hora: "Por Hora",
  };

  const tipo = form.tipo_viagem;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converter em Reserva</DialogTitle>
          <DialogDescription>
            Revise e atualize os dados antes de confirmar a conversão. Tipo: {tipoMap[tipo] || tipo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Cliente */}
          <fieldset className="space-y-3">
            <legend className="font-semibold text-foreground text-sm">Dados do Cliente</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome Completo" value={form.cliente_nome} onChange={(v) => set("cliente_nome", v)} />
              <Field label="WhatsApp / Telefone" value={form.cliente_telefone} onChange={(v) => set("cliente_telefone", v)} />
              <Field label="E-mail" value={form.cliente_email} onChange={(v) => set("cliente_email", v)} />
              <Field label="Como nos encontrou" value={form.cliente_origem} onChange={(v) => set("cliente_origem", v)} />
            </div>
          </fieldset>

          {/* Ida */}
          {(tipo === "somente_ida" || tipo === "ida_e_volta") && (
            <fieldset className="space-y-3 border-t pt-3">
              <legend className="font-semibold text-foreground text-sm">→ Ida</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Passageiros" value={form.ida_passageiros} onChange={(v) => set("ida_passageiros", v)} type="number" />
                <Field label="Embarque" value={form.ida_embarque} onChange={(v) => set("ida_embarque", v)} />
                <Field label="Destino" value={form.ida_destino} onChange={(v) => set("ida_destino", v)} />
                <Field label="Data" value={form.ida_data} onChange={(v) => set("ida_data", v)} type="date" />
                <Field label="Hora" value={form.ida_hora} onChange={(v) => set("ida_hora", v)} type="time" />
                <Field label="Cupom" value={form.ida_cupom} onChange={(v) => set("ida_cupom", v)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mensagem / Observações</Label>
                <Textarea value={form.ida_mensagem} onChange={(e) => set("ida_mensagem", e.target.value)} rows={2} />
              </div>
            </fieldset>
          )}

          {/* Volta */}
          {tipo === "ida_e_volta" && (
            <fieldset className="space-y-3 border-t pt-3">
              <legend className="font-semibold text-foreground text-sm">⇆ Volta</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Passageiros" value={form.volta_passageiros} onChange={(v) => set("volta_passageiros", v)} type="number" />
                <Field label="Embarque" value={form.volta_embarque} onChange={(v) => set("volta_embarque", v)} />
                <Field label="Destino" value={form.volta_destino} onChange={(v) => set("volta_destino", v)} />
                <Field label="Data" value={form.volta_data} onChange={(v) => set("volta_data", v)} type="date" />
                <Field label="Hora" value={form.volta_hora} onChange={(v) => set("volta_hora", v)} type="time" />
                <Field label="Cupom" value={form.volta_cupom} onChange={(v) => set("volta_cupom", v)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mensagem / Observações</Label>
                <Textarea value={form.volta_mensagem} onChange={(e) => set("volta_mensagem", e.target.value)} rows={2} />
              </div>
            </fieldset>
          )}

          {/* Por Hora */}
          {tipo === "por_hora" && (
            <fieldset className="space-y-3 border-t pt-3">
              <legend className="font-semibold text-foreground text-sm">⏱ Por Hora</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Passageiros" value={form.por_hora_passageiros} onChange={(v) => set("por_hora_passageiros", v)} type="number" />
                <Field label="Endereço de Início" value={form.por_hora_endereco_inicio} onChange={(v) => set("por_hora_endereco_inicio", v)} />
                <Field label="Data" value={form.por_hora_data} onChange={(v) => set("por_hora_data", v)} type="date" />
                <Field label="Hora" value={form.por_hora_hora} onChange={(v) => set("por_hora_hora", v)} type="time" />
                <Field label="Qtd. Horas" value={form.por_hora_qtd_horas} onChange={(v) => set("por_hora_qtd_horas", v)} type="number" />
                <Field label="Ponto de Encerramento" value={form.por_hora_ponto_encerramento} onChange={(v) => set("por_hora_ponto_encerramento", v)} />
                <Field label="Cupom" value={form.por_hora_cupom} onChange={(v) => set("por_hora_cupom", v)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Itinerário / Observações</Label>
                <Textarea value={form.por_hora_itinerario} onChange={(e) => set("por_hora_itinerario", e.target.value)} rows={2} />
              </div>
            </fieldset>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(form)} disabled={loading}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {loading ? "Convertendo..." : "Confirmar Reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
