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
import { Eye, ArrowRightLeft } from "lucide-react";
import { useTransfer, Solicitacao } from "@/contexts/TransferContext";
import { useToast } from "@/hooks/use-toast";

const statusMap: Record<Solicitacao["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  convertida: { label: "Convertida", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export default function TransferSolicitacoes() {
  const { solicitacoes, converterSolicitacao } = useTransfer();
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const { toast } = useToast();

  const handleConverter = (sol: Solicitacao) => {
    converterSolicitacao(sol.id);
    toast({
      title: "Solicitação convertida",
      description: `${sol.cliente} foi convertida em reserva com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de Transfer</h1>
        <p className="text-muted-foreground">
          Registros recebidos via site. Converta em reserva para confirmar.
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Solicitações Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {solicitacoes.length === 0 ? (
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
                    <TableCell className="whitespace-nowrap">{sol.data}</TableCell>
                    <TableCell className="font-medium">{sol.cliente}</TableCell>
                    <TableCell>{sol.tipo}</TableCell>
                    <TableCell className="max-w-[160px] truncate" title={sol.embarque}>
                      {sol.embarque}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate" title={sol.desembarque}>
                      {sol.desembarque}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{sol.dataHora}</TableCell>
                    <TableCell className="text-center">{sol.qtdPax}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[sol.status].variant}>
                        {statusMap[sol.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(sol)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sol.status === "pendente" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConverter(sol)}
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                            Converter
                          </Button>
                        )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
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
              <Detail
                label="Status"
                value={statusMap[selected.status].label}
              />
              {selected.status === "pendente" && (
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    handleConverter(selected);
                    setSelected(null);
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Converter em Reserva
                </Button>
              )}
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
