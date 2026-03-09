import { useState, useEffect } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Eye, Trash2, Plus, RefreshCw, MessageSquare, Download, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ComunicarDialog from "@/components/ComunicarDialog";

interface SolicitacaoTaxi {
  id: string;
  codigo: string | null;
  tenant_id: string | null;
  cliente_nome: string | null;
  cliente_telefone: string | null;
  cliente_email: string | null;
  cliente_origem: string | null;
  endereco_origem: string | null;
  endereco_destino: string | null;
  data_servico: string | null;
  horario: string | null;
  numero_passageiros: number | null;
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  confirmada: { label: "Confirmada", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
  concluida: { label: "Concluída", variant: "secondary" },
};

const emptyForm = {
  cliente_nome: "",
  cliente_telefone: "",
  cliente_email: "",
  cliente_origem: "",
  endereco_origem: "",
  endereco_destino: "",
  data_servico: "",
  horario: "",
  numero_passageiros: "1",
  observacoes: "",
  status: "pendente",
};

export default function TaxiSolicitacoes() {
  const tenantId = useTenantId();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoTaxi[]>([]);
  const [selected, setSelected] = useState<SolicitacaoTaxi | null>(null);
  const [editing, setEditing] = useState<SolicitacaoTaxi | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comunicando, setComunicando] = useState<SolicitacaoTaxi | null>(null);
  const { toast } = useToast();

  const fetchSolicitacoes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("solicitacoes_taxi" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSolicitacoes(data as SolicitacaoTaxi[]);
    setLoading(false);
  };

  useEffect(() => { fetchSolicitacoes(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("solicitacoes_taxi" as any).delete().eq("id", id);
    if (!error) {
      toast({ title: "Solicitação excluída" });
      fetchSolicitacoes();
      setSelected(null);
    } else {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (sol: SolicitacaoTaxi) => {
    setFormData({
      cliente_nome: sol.cliente_nome || "",
      cliente_telefone: sol.cliente_telefone || "",
      cliente_email: sol.cliente_email || "",
      cliente_origem: sol.cliente_origem || "",
      endereco_origem: sol.endereco_origem || "",
      endereco_destino: sol.endereco_destino || "",
      data_servico: sol.data_servico || "",
      horario: sol.horario || "",
      numero_passageiros: String(sol.numero_passageiros ?? 1),
      observacoes: sol.observacoes || "",
      status: sol.status,
    });
    setEditing(sol);
    setCreating(true);
    setSelected(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      numero_passageiros: formData.numero_passageiros ? Number(formData.numero_passageiros) : 1,
      tenant_id: tenantId,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("solicitacoes_taxi" as any).update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("solicitacoes_taxi" as any).insert(payload));
    }

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Solicitação atualizada!" : "Solicitação criada!" });
      setCreating(false);
      setEditing(null);
      fetchSolicitacoes();
    }
    setSaving(false);
  };

  const handleExportCSV = () => {
    const headers = ["Código", "Data", "Cliente", "Telefone", "E-mail", "Origem", "Destino", "Data Serviço", "Horário", "Pax", "Status"];
    const rows = solicitacoes.map((s) => [
      s.codigo || "",
      new Date(s.created_at).toLocaleString("pt-BR"),
      s.cliente_nome || "",
      s.cliente_telefone || "",
      s.cliente_email || "",
      s.endereco_origem || "",
      s.endereco_destino || "",
      s.data_servico || "",
      s.horario || "",
      String(s.numero_passageiros ?? ""),
      statusMap[s.status]?.label || s.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "solicitacoes-taxi.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const field = (key: keyof typeof formData, label: string, type = "text", props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={formData[key]}
        onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
        {...props}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitações de Taxi</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de corridas de taxi.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchSolicitacoes} title="Recarregar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={solicitacoes.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nova Solicitação
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
            <p className="text-muted-foreground text-sm">Nenhuma solicitação registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Origem</TableHead>
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
                    <TableCell className="font-mono text-xs text-primary whitespace-nowrap">{sol.codigo || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(sol.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{sol.cliente_nome || "—"}</TableCell>
                    <TableCell>{sol.cliente_telefone || "—"}</TableCell>
                    <TableCell className="max-w-[140px] truncate" title={sol.endereco_origem || ""}>{sol.endereco_origem || "—"}</TableCell>
                    <TableCell className="max-w-[140px] truncate" title={sol.endereco_destino || ""}>{sol.endereco_destino || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {[sol.data_servico, sol.horario].filter(Boolean).join(" ") || "—"}
                    </TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => openEdit(sol)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setComunicando(sol)} title="Comunicar ao cliente">
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
            <DialogDescription className="font-mono text-xs">{selected?.codigo || selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Código" value={selected.codigo || "—"} />
              <Detail label="Cliente" value={selected.cliente_nome || "—"} />
              <Detail label="Telefone / WhatsApp" value={selected.cliente_telefone || "—"} />
              <Detail label="E-mail" value={selected.cliente_email || "—"} />
              <Detail label="Como nos encontrou" value={selected.cliente_origem || "—"} />
              <div className="border-t pt-2 mt-2" />
              <Detail label="Endereço de Origem" value={selected.endereco_origem || "—"} />
              <Detail label="Endereço de Destino" value={selected.endereco_destino || "—"} />
              <Detail label="Data do Serviço" value={selected.data_servico || "—"} />
              <Detail label="Horário" value={selected.horario || "—"} />
              <Detail label="Passageiros" value={String(selected.numero_passageiros ?? "—")} />
              <Detail label="Observações" value={selected.observacoes || "—"} />
              <div className="border-t pt-2 mt-2" />
              <Detail label="Status" value={statusMap[selected.status]?.label || selected.status} />
              <Detail label="Recebido em" value={new Date(selected.created_at).toLocaleString("pt-BR")} />
              <div className="flex gap-2 mt-3">
                <Button className="flex-1" variant="outline" onClick={() => openEdit(selected)}>
                  <Pencil className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button className="flex-1" onClick={() => { setSelected(null); setComunicando(selected); }}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Comunicar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={creating} onOpenChange={(v) => { if (!v) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Solicitação" : "Nova Solicitação de Taxi"}</DialogTitle>
            <DialogDescription>Preencha os dados da corrida de taxi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field("cliente_nome", "Nome do Cliente")}
              {field("cliente_telefone", "Telefone / WhatsApp", "tel")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("cliente_email", "E-mail", "email")}
              {field("cliente_origem", "Como nos encontrou")}
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-foreground mb-3">Dados da Corrida</p>
              <div className="space-y-3">
                {field("endereco_origem", "Endereço de Origem")}
                {field("endereco_destino", "Endereço de Destino")}
                <div className="grid grid-cols-2 gap-3">
                  {field("data_servico", "Data do Serviço", "date")}
                  {field("horario", "Horário", "time")}
                </div>
                {field("numero_passageiros", "Número de Passageiros", "number", { min: 1 })}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground"
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="pendente">Pendente</option>
                <option value="confirmada">Confirmada</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData((p) => ({ ...p, observacoes: e.target.value }))}
                rows={3}
                placeholder="Informações adicionais..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setCreating(false); setEditing(null); }}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar Solicitação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comunicar Dialog */}
      {comunicando && (
        <ComunicarDialog
          open={!!comunicando}
          onClose={() => setComunicando(null)}
          context={{
            nome: comunicando.cliente_nome || "",
            telefone: comunicando.cliente_telefone || "",
            origem: comunicando.endereco_origem || "",
            destino: comunicando.endereco_destino || "",
            data: comunicando.data_servico || "",
            horario: comunicando.horario || "",
            codigo: comunicando.codigo || "",
          }}
        />
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  );
}
