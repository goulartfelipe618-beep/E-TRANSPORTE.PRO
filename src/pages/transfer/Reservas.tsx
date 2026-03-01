import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useTransfer, Reserva } from "@/contexts/TransferContext";

const statusMap: Record<Reserva["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmada: { label: "Confirmada", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "secondary" },
  concluida: { label: "Concluída", variant: "outline" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export default function TransferReservas() {
  const { reservas } = useTransfer();
  const [selected, setSelected] = useState<Reserva | null>(null);

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
          {reservas.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma reserva ainda. Converta uma solicitação em Transfer &gt; Solicitações.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                    <TableCell className="font-mono text-xs">{res.id}</TableCell>
                    <TableCell className="font-medium">{res.cliente}</TableCell>
                    <TableCell>{res.tipo}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={res.embarque}>
                      {res.embarque}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate" title={res.desembarque}>
                      {res.desembarque}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{res.dataHora}</TableCell>
                    <TableCell className="text-center">{res.qtdPax}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[res.status].variant}>
                        {statusMap[res.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelected(res)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>{selected?.id} (origem: {selected?.solicitacaoId})</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Cliente" value={selected.cliente} />
              <Detail label="Tipo" value={selected.tipo} />
              <Detail label="Embarque" value={selected.embarque} />
              <Detail label="Desembarque" value={selected.desembarque} />
              <Detail label="Data/Hora" value={selected.dataHora} />
              <Detail label="Qtd. Passageiros" value={String(selected.qtdPax)} />
              <Detail label="Telefone" value={selected.telefone || "—"} />
              <Detail label="E-mail" value={selected.email || "—"} />
              <Detail label="Observações" value={selected.observacoes || "Nenhuma"} />
              <Detail label="Status" value={statusMap[selected.status].label} />
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
