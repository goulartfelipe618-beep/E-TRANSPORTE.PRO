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
import { Eye, ArrowRightLeft, Trash2, Plus, RefreshCw, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import GruposConvertForm from "./ConvertForm";
import ComunicarDialog from "@/components/ComunicarDialog";

type SolicitacaoRow = Tables<"solicitacoes_grupos">;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  convertida: { label: "Convertida", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const veiculoMap: Record<string, string> = {
  onibus: "Ônibus",
  micro_onibus: "Micro-ônibus",
  van: "Van",
};

export default function GruposSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRow[]>([]);
  const [selected, setSelected] = useState<SolicitacaoRow | null>(null);
  const [converting, setConverting] = useState<SolicitacaoRow | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingManual, setCreatingManual] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [comunicando, setComunicando] = useState<SolicitacaoRow | null>(null);
  const { toast } = useToast();

  const fetchSolicitacoes = async () => {
    const { data, error } = await supabase
      .from("solicitacoes_grupos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSolicitacoes(data);
    setLoading(false);
  };

  useEffect(() => { fetchSolicitacoes(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("solicitacoes_grupos").delete().eq("id", id);
    if (!error) {
      toast({ title: "Solicitação excluída" });
      fetchSolicitacoes();
      setSelected(null);
    }
  };

  const handleConvertConfirm = async (formData: Record<string, any>) => {
    if (!converting) return;
    setConvertLoading(true);
    const numFields = ["numero_passageiros", "valor_base", "desconto_percentual", "valor_total"];
    const reserva: Record<string, any> = { solicitacao_id: converting.id, status: "confirmada" };
    for (const [k, v] of Object.entries(formData)) {
      reserva[k] = numFields.includes(k) ? (v !== "" && v != null ? Number(v) : null) : (v || null);
    }
    const { error: insertErr } = await supabase.from("reservas_grupos").insert(reserva as any);
    if (insertErr) {
      toast({ title: "Erro ao criar reserva", description: insertErr.message, variant: "destructive" });
      setConvertLoading(false);
      return;
    }
    await supabase.from("solicitacoes_grupos").update({ status: "convertida" }).eq("id", converting.id);
    toast({ title: "Reserva de grupo criada!", description: `${formData.cliente_nome || "Cliente"} convertida em reserva.` });
    setConverting(null);
    setConvertLoading(false);
    fetchSolicitacoes();
  };

  const handleCreateReserva = async (formData: Record<string, any>) => {
    setCreateLoading(true);
    const numFields = ["numero_passageiros", "valor_base", "desconto_percentual", "valor_total"];
    const reserva: Record<string, any> = { status: "confirmada" };
    for (const [k, v] of Object.entries(formData)) {
      reserva[k] = numFields.includes(k) ? (v !== "" && v != null ? Number(v) : null) : (v || null);
    }
    const { error } = await supabase.from("reservas_grupos").insert(reserva as any);
    if (error) {
      toast({ title: "Erro ao criar reserva", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reserva criada!", description: `${formData.cliente_nome || "Cliente"} — reserva manual criada.` });
      setCreatingManual(false);
    }
    setCreateLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitações de Grupos</h1>
          <p className="text-muted-foreground">Registros recebidos via webhook. Converta em reserva para confirmar.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { setLoading(true); fetchSolicitacoes(); }} title="Recarregar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setCreatingManual(true)}>
            <Plus className="h-4 w-4 mr-2" /> Criar Reserva
          </Button>
        </div>
      </div>

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
                  <TableHead>Veículo</TableHead>
                  <TableHead>Embarque</TableHead>
                  <TableHead>Destino</TableHead>
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
                    <TableCell>{veiculoMap[sol.tipo_veiculo || ""] || sol.tipo_veiculo || "—"}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={sol.endereco_embarque || ""}>{sol.endereco_embarque || "—"}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={sol.destino || ""}>{sol.destino || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{`${sol.data_ida || ""} ${sol.hora_ida || ""}`.trim() || "—"}</TableCell>
                    <TableCell className="text-center">{sol.numero_passageiros ?? "—"}</TableCell>
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
                        <Button variant="outline" size="sm" onClick={() => setComunicando(sol)} title="Comunicar ao cliente">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Comunicar
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
            <DialogTitle>Detalhes da Solicitação de Grupo</DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Tipo de Veículo" value={veiculoMap[selected.tipo_veiculo || ""] || selected.tipo_veiculo || "—"} />
              <Detail label="Passageiros" value={String(selected.numero_passageiros ?? "—")} />
              <Detail label="Cliente" value={selected.cliente_nome || "—"} />
              <Detail label="WhatsApp" value={selected.cliente_whatsapp || "—"} />
              <Detail label="E-mail" value={selected.cliente_email || "—"} />
              <Detail label="Como nos encontrou" value={selected.cliente_origem || "—"} />
              <Detail label="Embarque" value={selected.endereco_embarque || "—"} />
              <Detail label="Destino" value={selected.destino || "—"} />
              <Detail label="Data de Ida" value={selected.data_ida || "—"} />
              <Detail label="Hora de Ida" value={selected.hora_ida || "—"} />
              <Detail label="Data de Retorno" value={selected.data_retorno || "—"} />
              <Detail label="Hora de Retorno" value={selected.hora_retorno || "—"} />
              <Detail label="Observações" value={selected.observacoes || "—"} />
              <Detail label="Cupom" value={selected.cupom || "—"} />
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

      <GruposConvertForm
        solicitacao={converting}
        open={!!converting}
        onClose={() => setConverting(null)}
        onConfirm={handleConvertConfirm}
        loading={convertLoading}
      />

      <GruposConvertForm
        open={creatingManual}
        onClose={() => setCreatingManual(false)}
        onConfirm={handleCreateReserva}
        loading={createLoading}
        mode="create"
      />

      <ComunicarDialog
        open={!!comunicando}
        onClose={() => setComunicando(null)}
        titulo={comunicando ? `Comunicar sobre solicitação de grupo de ${comunicando.cliente_nome || "Cliente"}` : undefined}
        payload={comunicando ? {
          tipo: "solicitacao_grupo",
          id: comunicando.id,
          tipo_veiculo: comunicando.tipo_veiculo,
          cliente_nome: comunicando.cliente_nome,
          cliente_whatsapp: comunicando.cliente_whatsapp,
          cliente_email: comunicando.cliente_email,
          embarque: comunicando.endereco_embarque,
          destino: comunicando.destino,
          data_ida: comunicando.data_ida,
          hora_ida: comunicando.hora_ida,
          passageiros: comunicando.numero_passageiros,
          status: comunicando.status,
        } : {}}
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
