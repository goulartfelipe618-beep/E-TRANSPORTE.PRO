import { useState, useEffect } from "react";
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
import { RefreshCw, Plus, Copy, Check, Trash2, Eye, Edit, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Campanha {
  id: string;
  nome: string;
  plataforma: string | null;
  link: string | null;
  cor: string;
  descricao: string | null;
  status: string;
  created_at: string;
}

const CORES = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4"];

export default function CampanhasAtivos() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [webhookOpen, setWebhookOpen] = useState<Campanha | null>(null);
  const [editOpen, setEditOpen] = useState<Campanha | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [nome, setNome] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [linkCampanha, setLinkCampanha] = useState("");
  const [cor, setCor] = useState(CORES[0]);
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("ativa");

  const { toast } = useToast();

  const fetchCampanhas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("campanhas")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCampanhas(data as Campanha[]);
    setLoading(false);
  };

  useEffect(() => { fetchCampanhas(); }, []);

  const resetForm = () => {
    setNome(""); setPlataforma(""); setLinkCampanha(""); setCor(CORES[0]); setDescricao(""); setStatus("ativa");
  };

  const handleCreate = async () => {
    if (!nome.trim()) return;
    setSaving(true);

    // 1. Create campanha
    const { data: campanha, error } = await supabase
      .from("campanhas")
      .insert({ nome: nome.trim(), plataforma: plataforma || null, link: linkCampanha || null, cor, descricao: descricao || null, status })
      .select()
      .single();

    if (error || !campanha) {
      toast({ title: "Erro ao criar campanha", description: error?.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // 2. Auto-create automação of type leads_campanha
    await supabase.from("automacoes").insert({
      nome: `Leads — ${nome.trim()}`,
      tipo: `leads_campanha:${campanha.id}`,
    });

    toast({ title: "Campanha criada com sucesso!" });
    resetForm();
    setCreateOpen(false);
    fetchCampanhas();
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editOpen || !nome.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("campanhas")
      .update({ nome: nome.trim(), plataforma: plataforma || null, link: linkCampanha || null, cor, descricao: descricao || null, status })
      .eq("id", editOpen.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Campanha atualizada!" });
      setEditOpen(null);
      resetForm();
      fetchCampanhas();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    // Delete associated automação
    const { data: autos } = await supabase.from("automacoes").select("id").like("tipo", `leads_campanha:${id}`);
    if (autos) {
      for (const a of autos) {
        await supabase.from("webhook_tests").delete().eq("automacao_id", a.id);
        await supabase.from("automacoes").delete().eq("id", a.id);
      }
    }
    await supabase.from("campanhas").delete().eq("id", id);
    toast({ title: "Campanha excluída" });
    fetchCampanhas();
  };

  const openEdit = (c: Campanha) => {
    setNome(c.nome); setPlataforma(c.plataforma || ""); setLinkCampanha(c.link || ""); setCor(c.cor); setDescricao(c.descricao || ""); setStatus(c.status);
    setEditOpen(c);
  };

  const getWebhookUrl = (campanha: Campanha) => {
    return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-solicitacao?campanha_id=${campanha.id}`;
  };

  const handleCopyWebhook = async (campanha: Campanha) => {
    await navigator.clipboard.writeText(getWebhookUrl(campanha));
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const [leadsCount, setLeadsCount] = useState<Record<string, number>>({});
  useEffect(() => {
    if (campanhas.length === 0) return;
    (async () => {
      const counts: Record<string, number> = {};
      for (const c of campanhas) {
        const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("campanha_id", c.id);
        counts[c.id] = count ?? 0;
      }
      setLeadsCount(counts);
    })();
  }, [campanhas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campanhas Ativas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchCampanhas} title="Recarregar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Todas as Campanhas</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : campanhas.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma campanha criada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campanhas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
                        {c.nome}
                      </div>
                    </TableCell>
                    <TableCell>{c.plataforma || "—"}</TableCell>
                    <TableCell>{leadsCount[c.id] ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ativa" ? "default" : "secondary"}>
                        {c.status === "ativa" ? "Ativa" : c.status === "pausada" ? "Pausada" : "Encerrada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setWebhookOpen(c)} title="Webhook">
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
                              <AlertDialogDescription>A automação associada e todos os dados serão removidos.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(c.id)}>Excluir</AlertDialogAction>
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
            <DialogTitle>Nova Campanha</DialogTitle>
            <DialogDescription>Crie uma campanha e receba um webhook para capturar leads automaticamente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Campanha *</label>
              <Input placeholder="Ex: Facebook Ads - Aluguel de Luxo" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plataforma/Fonte</label>
              <Input placeholder="Ex: Google, Meta, Landing Page" value={plataforma} onChange={(e) => setPlataforma(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link da Campanha</label>
              <Input placeholder="https://exemplo.com/campanha" value={linkCampanha} onChange={(e) => setLinkCampanha(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor da Campanha</label>
              <div className="flex gap-2 flex-wrap">
                {CORES.map((c) => (
                  <button key={c} type="button" onClick={() => setCor(c)} className={`h-8 w-8 rounded-full border-2 transition-all ${cor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea placeholder="Descreva a campanha..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
            <DialogTitle>Editar Campanha</DialogTitle>
            <DialogDescription>Atualize as informações da campanha.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Campanha *</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plataforma/Fonte</label>
              <Input value={plataforma} onChange={(e) => setPlataforma(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link da Campanha</label>
              <Input value={linkCampanha} onChange={(e) => setLinkCampanha(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor da Campanha</label>
              <div className="flex gap-2 flex-wrap">
                {CORES.map((c) => (
                  <button key={c} type="button" onClick={() => setCor(c)} className={`h-8 w-8 rounded-full border-2 transition-all ${cor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={saving || !nome.trim()}>{saving ? "Salvando..." : "Atualizar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={!!webhookOpen} onOpenChange={(o) => { if (!o) setWebhookOpen(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook da Campanha: {webhookOpen?.nome}</DialogTitle>
            <DialogDescription>Use esta URL para enviar leads automaticamente para esta campanha.</DialogDescription>
          </DialogHeader>
          {webhookOpen && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Webhook</label>
                <div className="flex gap-2">
                  <Input readOnly value={getWebhookUrl(webhookOpen)} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => handleCopyWebhook(webhookOpen)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-4 rounded text-sm">
                <p className="text-muted-foreground text-xs">As variáveis do webhook são configuradas em <strong>Sistema &gt; Automações</strong>. A automação correspondente a esta campanha é criada automaticamente.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookOpen(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
