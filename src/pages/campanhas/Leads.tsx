import { useState, useEffect } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw, Plus, Trash2, Edit, Download, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ComunicarDialog from "@/components/ComunicarDialog";

interface Lead {
  id: string;
  campanha_id: string | null;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: string;
  observacoes: string | null;
  valor_venda: number | null;
  data_conversao: string | null;
  created_at: string;
}

interface Campanha {
  id: string;
  nome: string;
  cor: string;
}

const STATUS_COLORS: Record<string, string> = {
  novo: "default",
  contato: "secondary",
  negociacao: "outline",
  convertido: "default",
  perdido: "destructive",
};

export default function CampanhasLeads() {
  const tenantId = useTenantId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCampanha, setFilterCampanha] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editOpen, setEditOpen] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comunicando, setComunicando] = useState<Lead | null>(null);

  // Form
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [campanhaId, setCampanhaId] = useState("");
  const [status, setStatus] = useState("novo");
  const [observacoes, setObservacoes] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [dataConversao, setDataConversao] = useState("");

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, campRes] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("campanhas").select("id, nome, cor"),
    ]);
    if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
    if (campRes.data) setCampanhas(campRes.data as Campanha[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = leads.filter((l) => {
    if (filterCampanha !== "all" && l.campanha_id !== filterCampanha) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    return true;
  });

  const getCampanhaNome = (id: string | null) => {
    if (!id) return "—";
    return campanhas.find((c) => c.id === id)?.nome || "—";
  };

  const resetForm = () => {
    setNome(""); setEmail(""); setTelefone(""); setCampanhaId(""); setStatus("novo"); setObservacoes(""); setValorVenda(""); setDataConversao("");
  };

  const openEditDialog = (l: Lead) => {
    setNome(l.nome); setEmail(l.email || ""); setTelefone(l.telefone || ""); setCampanhaId(l.campanha_id || ""); setStatus(l.status); setObservacoes(l.observacoes || "");
    setValorVenda(l.valor_venda ? String(l.valor_venda) : ""); setDataConversao(l.data_conversao || "");
    setEditOpen(l);
  };

  const handleCreate = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      nome: nome.trim(), email: email || null, telefone: telefone || null,
      campanha_id: campanhaId || null, status, observacoes: observacoes || null,
      valor_venda: valorVenda ? parseFloat(valorVenda) : 0, data_conversao: dataConversao || null,
      tenant_id: tenantId,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Lead criado!" }); resetForm(); setCreateOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editOpen) return;
    setSaving(true);
    const { error } = await supabase.from("leads").update({
      nome: nome.trim(), email: email || null, telefone: telefone || null,
      campanha_id: campanhaId || null, status, observacoes: observacoes || null,
      valor_venda: valorVenda ? parseFloat(valorVenda) : 0, data_conversao: dataConversao || null,
    }).eq("id", editOpen.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Lead atualizado!" }); setEditOpen(null); resetForm(); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("leads").delete().eq("id", id);
    toast({ title: "Lead excluído" });
    fetchData();
  };

  const handleExportCSV = () => {
    const headers = ["Nome", "E-mail", "Telefone", "Campanha", "Status", "Data"];
    const rows = filtered.map((l) => [l.nome, l.email || "", l.telefone || "", getCampanhaNome(l.campanha_id), l.status, new Date(l.created_at).toLocaleString("pt-BR")]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome *</label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">E-mail</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Telefone/WhatsApp *</label>
        <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Campanha de Origem</label>
        <Select value={campanhaId} onValueChange={setCampanhaId}>
          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem campanha</SelectItem>
            {campanhas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="contato">Contato</SelectItem>
            <SelectItem value="negociacao">Negociação</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Observações</label>
        <Textarea placeholder="Notas sobre o lead..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor da Venda (R$)</label>
          <Input type="number" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Data da Conversão</label>
          <Input type="date" value={dataConversao} onChange={(e) => setDataConversao(e.target.value)} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Gerencie todos os leads capturados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} title="Recarregar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campanha</label>
              <Select value={filterCampanha} onValueChange={setFilterCampanha}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Campanhas</SelectItem>
                  {campanhas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contato">Contato</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Todos os Leads</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum lead encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs text-primary whitespace-nowrap">{(l as any).codigo || "—"}</TableCell>
                    <TableCell className="font-medium">{l.nome}</TableCell>
                    <TableCell className="text-sm">{l.email || "—"}</TableCell>
                    <TableCell className="text-sm">{l.telefone || "—"}</TableCell>
                    <TableCell className="text-sm">{getCampanhaNome(l.campanha_id)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[l.status] as any || "secondary"} className="capitalize">{l.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => setComunicando(l)} title="Comunicar">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Comunicar
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(l)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
                              <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(l.id)}>Excluir</AlertDialogAction>
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>Adicione um lead manualmente.</DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !nome.trim()}>{saving ? "Criando..." : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>Atualize as informações do lead.</DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={saving || !nome.trim()}>{saving ? "Salvando..." : "Atualizar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ComunicarDialog
        open={!!comunicando}
        onClose={() => setComunicando(null)}
        titulo={comunicando ? `Comunicar com ${comunicando.nome}` : undefined}
        payload={comunicando ? {
          tipo: "lead",
          id: comunicando.id,
          nome: comunicando.nome,
          telefone: comunicando.telefone,
          email: comunicando.email,
          campanha: getCampanhaNome(comunicando.campanha_id),
          status: comunicando.status,
          observacoes: comunicando.observacoes,
          valor_venda: comunicando.valor_venda,
        } : {}}
      />
    </div>
  );
}
