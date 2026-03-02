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
import { Eye, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { generateReservaPdf } from "@/lib/generateReservaPdf";
import type { Tables } from "@/integrations/supabase/types";

type ReservaRow = Tables<"reservas_transfer">;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmada: { label: "Confirmada", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "secondary" },
  concluida: { label: "Concluída", variant: "outline" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const tipoMap: Record<string, string> = {
  somente_ida: "Somente Ida",
  ida_e_volta: "Ida e Volta",
  por_hora: "Por Hora",
};

export default function TransferReservas() {
  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [selected, setSelected] = useState<ReservaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { projectName, logoUrl, mapProvider, mapApiKey } = useGlobalConfig();

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas_transfer")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReservas(data);
    setLoading(false);
  };

  useEffect(() => { fetchReservas(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reservas_transfer").delete().eq("id", id);
    if (!error) {
      toast({ title: "Reserva excluída" });
      fetchReservas();
      setSelected(null);
    }
  };

  const getEmbarque = (r: ReservaRow) => r.tipo_viagem === "por_hora" ? r.por_hora_endereco_inicio || "—" : r.ida_embarque || "—";
  const getDesembarque = (r: ReservaRow) => r.tipo_viagem === "por_hora" ? r.por_hora_ponto_encerramento || "—" : r.ida_destino || "—";
  const getDataHora = (r: ReservaRow) => {
    if (r.tipo_viagem === "por_hora") return `${r.por_hora_data || ""} ${r.por_hora_hora || ""}`.trim() || "—";
    return `${r.ida_data || ""} ${r.ida_hora || ""}`.trim() || "—";
  };
  const getPax = (r: ReservaRow) => r.tipo_viagem === "por_hora" ? r.por_hora_passageiros ?? "—" : r.ida_passageiros ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground">Reservas convertidas a partir de solicitações</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Reservas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : reservas.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma reserva ainda. Converta uma solicitação em Transfer &gt; Solicitações.
            </p>
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
                {reservas.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(res.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{res.cliente_nome || "—"}</TableCell>
                    <TableCell>{tipoMap[res.tipo_viagem] || res.tipo_viagem}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={getEmbarque(res)}>{getEmbarque(res)}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={getDesembarque(res)}>{getDesembarque(res)}</TableCell>
                    <TableCell className="whitespace-nowrap">{getDataHora(res)}</TableCell>
                    <TableCell className="text-center">{getPax(res)}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[res.status]?.variant || "outline"}>
                        {statusMap[res.status]?.label || res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(res)} title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(res.id)}>Excluir</AlertDialogAction>
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
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="flex justify-end -mt-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => generateReservaPdf(selected, { projectName, logoUrl, mapProvider, mapApiKey })}
              >
                <Download className="h-4 w-4" />
                Baixar Confirmação (PDF)
              </Button>
            </div>
          )}
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
              <Detail label="Criado em" value={new Date(selected.created_at).toLocaleString("pt-BR")} />
            </div>
          )}
        </DialogContent>
      </Dialog>
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
