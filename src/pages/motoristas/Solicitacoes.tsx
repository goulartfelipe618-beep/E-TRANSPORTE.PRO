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
import { Eye, Trash2, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SolicitacaoMotorista {
  id: string;
  nome_completo: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  cnh_categoria: string | null;
  cnh_numero: string | null;
  possui_veiculo: boolean;
  veiculo_marca: string | null;
  veiculo_modelo: string | null;
  veiculo_ano: string | null;
  veiculo_placa: string | null;
  experiencia: string | null;
  mensagem: string | null;
  status: string;
  created_at: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  aprovada: { label: "Aprovada", variant: "default" },
  rejeitada: { label: "Rejeitada", variant: "destructive" },
};

export default function MotoristasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMotorista[]>([]);
  const [selected, setSelected] = useState<SolicitacaoMotorista | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSolicitacoes = async () => {
    const { data, error } = await supabase
      .from("solicitacoes_motorista")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSolicitacoes(data as SolicitacaoMotorista[]);
    setLoading(false);
  };

  useEffect(() => { fetchSolicitacoes(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("solicitacoes_motorista").delete().eq("id", id);
    if (!error) {
      toast({ title: "Solicitação excluída" });
      fetchSolicitacoes();
      setSelected(null);
    }
  };

  const handleStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("solicitacoes_motorista").update({ status: newStatus } as any).eq("id", id);
    if (!error) {
      toast({ title: `Solicitação ${newStatus === "aprovada" ? "aprovada" : "rejeitada"}` });
      fetchSolicitacoes();
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de Motoristas</h1>
        <p className="text-muted-foreground">Solicitações recebidas de pessoas que desejam ser motoristas parceiros.</p>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Veículo Próprio</TableHead>
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
                    <TableCell className="font-medium">{sol.nome_completo}</TableCell>
                    <TableCell>{sol.telefone || "—"}</TableCell>
                    <TableCell>{[sol.cidade, sol.estado].filter(Boolean).join("/") || "—"}</TableCell>
                    <TableCell>{sol.cnh_categoria || "—"}</TableCell>
                    <TableCell>{sol.possui_veiculo ? "Sim" : "Não"}</TableCell>
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
                          <>
                            <Button variant="default" size="sm" onClick={() => handleStatus(sol.id, "aprovada")} title="Aprovar">
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Aprovar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleStatus(sol.id, "rejeitada")} title="Rejeitar">
                              <UserX className="h-3.5 w-3.5 mr-1" /> Rejeitar
                            </Button>
                          </>
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
              <Detail label="Nome Completo" value={selected.nome_completo} />
              <Detail label="CPF" value={selected.cpf || "—"} />
              <Detail label="Telefone" value={selected.telefone || "—"} />
              <Detail label="E-mail" value={selected.email || "—"} />
              <Detail label="Cidade" value={selected.cidade || "—"} />
              <Detail label="Estado" value={selected.estado || "—"} />

              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-foreground mb-1">Habilitação</p>
              </div>
              <Detail label="CNH Número" value={selected.cnh_numero || "—"} />
              <Detail label="Categoria" value={selected.cnh_categoria || "—"} />

              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-foreground mb-1">Veículo</p>
              </div>
              <Detail label="Possui Veículo" value={selected.possui_veiculo ? "Sim" : "Não"} />
              {selected.possui_veiculo && (
                <>
                  <Detail label="Marca" value={selected.veiculo_marca || "—"} />
                  <Detail label="Modelo" value={selected.veiculo_modelo || "—"} />
                  <Detail label="Ano" value={selected.veiculo_ano || "—"} />
                  <Detail label="Placa" value={selected.veiculo_placa || "—"} />
                </>
              )}

              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-foreground mb-1">Informações Adicionais</p>
              </div>
              <Detail label="Experiência" value={selected.experiencia || "—"} />
              <Detail label="Mensagem" value={selected.mensagem || "—"} />

              <Detail label="Status" value={statusMap[selected.status]?.label || selected.status} />
              <Detail label="Recebido em" value={new Date(selected.created_at).toLocaleString("pt-BR")} />

              {selected.status === "pendente" && (
                <div className="flex gap-2 mt-2">
                  <Button className="flex-1" onClick={() => handleStatus(selected.id, "aprovada")}>
                    <UserCheck className="h-4 w-4 mr-2" /> Aprovar
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleStatus(selected.id, "rejeitada")}>
                    <UserX className="h-4 w-4 mr-2" /> Rejeitar
                  </Button>
                </div>
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
