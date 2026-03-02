import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRightLeft, Copy, Check, Link, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import ConvertForm from "./ConvertForm";

type SolicitacaoRow = Tables<"solicitacoes_transfer">;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  convertida: { label: "Convertida", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const tipoMap: Record<string, string> = {
  somente_ida: "Somente Ida",
  ida_e_volta: "Ida e Volta",
  por_hora: "Por Hora",
};

export default function TransferSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRow[]>([]);
  const [selected, setSelected] = useState<SolicitacaoRow | null>(null);
  const [converting, setConverting] = useState<SolicitacaoRow | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-solicitacao`;

  const fetchSolicitacoes = async () => {
    const { data, error } = await supabase
      .from("solicitacoes_transfer")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSolicitacoes(data);
    setLoading(false);
  };

  useEffect(() => { fetchSolicitacoes(); }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "Link copiado!", description: "URL do webhook copiada para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("solicitacoes_transfer").delete().eq("id", id);
    if (!error) {
      toast({ title: "Solicitação excluída" });
      fetchSolicitacoes();
      setSelected(null);
    }
  };

  const handleConvertConfirm = async (formData: Record<string, any>) => {
    if (!converting) return;
    setConvertLoading(true);

    // Build reserva insert payload
    const reserva: Record<string, any> = {
      solicitacao_id: converting.id,
      status: "confirmada",
    };

    // Copy all fields, converting empty strings to null and numbers where needed
    const numFields = ["ida_passageiros", "volta_passageiros", "por_hora_passageiros", "por_hora_qtd_horas", "valor_base", "desconto_percentual", "valor_total"];
    for (const [k, v] of Object.entries(formData)) {
      reserva[k] = numFields.includes(k) ? (v !== "" && v != null ? Number(v) : null) : (v || null);
    }

    const { error: insertErr } = await supabase.from("reservas_transfer").insert(reserva as any);
    if (insertErr) {
      toast({ title: "Erro ao criar reserva", description: insertErr.message, variant: "destructive" });
      setConvertLoading(false);
      return;
    }

    // Mark solicitacao as converted
    await supabase.from("solicitacoes_transfer").update({ status: "convertida" }).eq("id", converting.id);
    toast({ title: "Reserva criada!", description: `${formData.cliente_nome || "Cliente"} convertida em reserva.` });
    setConverting(null);
    setConvertLoading(false);
    fetchSolicitacoes();
  };

  const getEmbarque = (s: SolicitacaoRow) => s.tipo_viagem === "por_hora" ? s.por_hora_endereco_inicio || "—" : s.ida_embarque || "—";
  const getDesembarque = (s: SolicitacaoRow) => s.tipo_viagem === "por_hora" ? s.por_hora_ponto_encerramento || "—" : s.ida_destino || "—";
  const getDataHora = (s: SolicitacaoRow) => {
    if (s.tipo_viagem === "por_hora") return `${s.por_hora_data || ""} ${s.por_hora_hora || ""}`.trim() || "—";
    return `${s.ida_data || ""} ${s.ida_hora || ""}`.trim() || "—";
  };
  const getPax = (s: SolicitacaoRow) => {
    if (s.tipo_viagem === "por_hora") return s.por_hora_passageiros ?? "—";
    return s.ida_passageiros ?? "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de Transfer</h1>
        <p className="text-muted-foreground">Registros recebidos via webhook do site. Converta em reserva para confirmar.</p>
      </div>

      {/* Webhook URL */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">URL do Webhook para o desenvolvedor do site:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{webhookUrl}</code>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Método: <strong>POST</strong> · Content-Type: <strong>application/json</strong>
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Solicitações Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : solicitacoes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma solicitação recebida.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Embarque</TableHead>
                  <TableHead>Desembarque</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead className="text-center">Pax</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(sol.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{sol.cliente_nome || "—"}</TableCell>
                    <TableCell>{tipoMap[sol.tipo_viagem] || sol.tipo_viagem}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={getEmbarque(sol)}>{getEmbarque(sol)}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={getDesembarque(sol)}>{getDesembarque(sol)}</TableCell>
                    <TableCell className="whitespace-nowrap">{getDataHora(sol)}</TableCell>
                    <TableCell className="text-center">{getPax(sol)}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[sol.status]?.variant || "outline"}>
                        {statusMap[sol.status]?.label || sol.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(sol)} title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sol.status === "pendente" && (
                          <Button variant="default" size="sm" onClick={() => setConverting(sol)}>
                            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                            Converter
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir solicitação?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sol.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Tipo de Viagem" value={tipoMap[selected.tipo_viagem] || selected.tipo_viagem} />
              <Detail label="Cliente" value={selected.cliente_nome || "—"} />
              <Detail label="Telefone / WhatsApp" value={selected.cliente_telefone || "—"} />
              <Detail label="E-mail" value={selected.cliente_email || "—"} />
              <Detail label="Como nos encontrou" value={selected.cliente_origem || "—"} />

              {(selected.tipo_viagem === "somente_ida" || selected.tipo_viagem === "ida_e_volta") && (
                <>
                  <div className="border-t pt-2 mt-2"><p className="font-semibold text-foreground mb-1">→ Ida</p></div>
                  <Detail label="Passageiros" value={String(selected.ida_passageiros ?? "—")} />
                  <Detail label="Embarque" value={selected.ida_embarque || "—"} />
                  <Detail label="Destino" value={selected.ida_destino || "—"} />
                  <Detail label="Data" value={selected.ida_data || "—"} />
                  <Detail label="Hora" value={selected.ida_hora || "—"} />
                  <Detail label="Mensagem" value={selected.ida_mensagem || "—"} />
                  <Detail label="Cupom" value={selected.ida_cupom || "—"} />
                </>
              )}

              {selected.tipo_viagem === "ida_e_volta" && (
                <>
                  <div className="border-t pt-2 mt-2"><p className="font-semibold text-foreground mb-1">⇆ Volta</p></div>
                  <Detail label="Passageiros" value={String(selected.volta_passageiros ?? "—")} />
                  <Detail label="Embarque" value={selected.volta_embarque || "—"} />
                  <Detail label="Destino" value={selected.volta_destino || "—"} />
                  <Detail label="Data" value={selected.volta_data || "—"} />
                  <Detail label="Hora" value={selected.volta_hora || "—"} />
                  <Detail label="Mensagem" value={selected.volta_mensagem || "—"} />
                  <Detail label="Cupom" value={selected.volta_cupom || "—"} />
                </>
              )}

              {selected.tipo_viagem === "por_hora" && (
                <>
                  <div className="border-t pt-2 mt-2"><p className="font-semibold text-foreground mb-1">⏱ Por Hora</p></div>
                  <Detail label="Passageiros" value={String(selected.por_hora_passageiros ?? "—")} />
                  <Detail label="Endereço de Início" value={selected.por_hora_endereco_inicio || "—"} />
                  <Detail label="Data" value={selected.por_hora_data || "—"} />
                  <Detail label="Hora" value={selected.por_hora_hora || "—"} />
                  <Detail label="Qtd. Horas" value={String(selected.por_hora_qtd_horas ?? "—")} />
                  <Detail label="Ponto de Encerramento" value={selected.por_hora_ponto_encerramento || "—"} />
                  <Detail label="Itinerário" value={selected.por_hora_itinerario || "—"} />
                  <Detail label="Cupom" value={selected.por_hora_cupom || "—"} />
                </>
              )}

              <Detail label="Status" value={statusMap[selected.status]?.label || selected.status} />
              <Detail label="Recebido em" value={new Date(selected.created_at).toLocaleString("pt-BR")} />

              {selected.status === "pendente" && (
                <Button className="w-full mt-2" onClick={() => { setSelected(null); setConverting(selected); }}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Converter em Reserva
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Conversion Form */}
      <ConvertForm
        solicitacao={converting}
        open={!!converting}
        onClose={() => setConverting(null)}
        onConfirm={handleConvertConfirm}
        loading={convertLoading}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  );
}
