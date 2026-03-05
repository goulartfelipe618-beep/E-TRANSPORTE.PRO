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
import { Eye, Trash2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ComunicarDialog from "@/components/ComunicarDialog";
import { useToast } from "@/hooks/use-toast";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import type { Tables } from "@/integrations/supabase/types";

type ReservaRow = Tables<"reservas_grupos">;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmada: { label: "Confirmada", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "secondary" },
  concluida: { label: "Concluída", variant: "outline" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const veiculoMap: Record<string, string> = {
  onibus: "Ônibus",
  micro_onibus: "Micro-ônibus",
  van: "Van",
};

export default function GruposReservas() {
  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [selected, setSelected] = useState<ReservaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [comunicando, setComunicando] = useState<ReservaRow | null>(null);
  const { toast } = useToast();
  const { projectName, logoUrl, mapProvider, mapApiKey } = useGlobalConfig();

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas_grupos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReservas(data);
    setLoading(false);
  };

  useEffect(() => { fetchReservas(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reservas_grupos").delete().eq("id", id);
    if (!error) {
      toast({ title: "Reserva excluída" });
      fetchReservas();
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservas de Grupos</h1>
        <p className="text-muted-foreground">Reservas convertidas a partir de solicitações de grupos</p>
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
              Nenhuma reserva ainda. Converta uma solicitação em Grupos &gt; Solicitações.
            </p>
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
                {reservas.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(res.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{res.cliente_nome || "—"}</TableCell>
                    <TableCell>{veiculoMap[res.tipo_veiculo || ""] || res.tipo_veiculo || "—"}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={res.endereco_embarque || ""}>{res.endereco_embarque || "—"}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={res.destino || ""}>{res.destino || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{`${res.data_ida || ""} ${res.hora_ida || ""}`.trim() || "—"}</TableCell>
                    <TableCell className="text-center">{res.numero_passageiros ?? "—"}</TableCell>
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
                        <Button variant="outline" size="sm" onClick={() => setComunicando(res)} title="Comunicar ao cliente">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Comunicar
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

      <ComunicarDialog
        open={!!comunicando}
        onClose={() => setComunicando(null)}
        titulo={comunicando ? `Comunicar sobre reserva de grupo de ${comunicando.cliente_nome || "Cliente"}` : undefined}
        payload={comunicando ? {
          tipo: "reserva_grupo",
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
          motorista_nome: comunicando.motorista_nome,
          motorista_telefone: comunicando.motorista_telefone,
          veiculo: comunicando.veiculo,
          valor_total: comunicando.valor_total,
          metodo_pagamento: comunicando.metodo_pagamento,
        } : {}}
      />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva de Grupo</DialogTitle>
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
              <Detail label="Motorista" value={selected.motorista_nome || "—"} />
              <Detail label="Tel. Motorista" value={selected.motorista_telefone || "—"} />
              <Detail label="Veículo" value={selected.veiculo || "—"} />
              <Detail label="Valor Total" value={selected.valor_total != null ? `R$ ${Number(selected.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"} />
              <Detail label="Pagamento" value={selected.metodo_pagamento || "—"} />
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
