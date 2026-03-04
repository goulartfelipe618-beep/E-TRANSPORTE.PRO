import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Building2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  ativo: boolean;
  created_at: string;
}

export default function MasterTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    if (data) setTenants(data as Tenant[]);
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleSave = async () => {
    if (!nome.trim() || !slug.trim()) return;
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("tenants").update({ nome: nome.trim(), slug: slug.trim() }).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Tenant atualizado!" }); }
    } else {
      const { error } = await supabase.from("tenants").insert({ nome: nome.trim(), slug: slug.trim() });
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Tenant criado!" }); }
    }
    setSaving(false);
    setDialogOpen(false);
    setEditing(null);
    setNome("");
    setSlug("");
    fetchTenants();
  };

  const handleToggle = async (tenant: Tenant, ativo: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "suspend_tenant", tenant_id: tenant.id, ativo },
      });
      if (error) throw error;
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, ativo } : t));
      toast({
        title: ativo ? "Tenant ativado" : "Tenant suspenso",
        description: !ativo ? "Todos os usuários deste tenant foram deslogados." : undefined,
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tenants").delete().eq("id", id);
    fetchTenants();
    toast({ title: "Tenant excluído" });
  };

  const openEdit = (t: Tenant) => {
    setEditing(t);
    setNome(t.nome);
    setSlug(t.slug);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setNome("");
    setSlug("");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">Gerencie os clientes do seu CRM white-label.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchTenants}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Novo Tenant</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum tenant cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.nome}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{t.slug}</code></TableCell>
                    <TableCell>
                      <Badge variant={t.ativo ? "default" : "secondary"}>{t.ativo ? "Ativo" : "Inativo"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Switch checked={t.ativo} onCheckedChange={(v) => handleToggle(t, v)} />
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir tenant?</AlertDialogTitle>
                              <AlertDialogDescription>Todos os dados associados serão removidos.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(t.id)}>Excluir</AlertDialogAction>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Tenant" : "Novo Tenant"}</DialogTitle>
            <DialogDescription>Preencha os dados do tenant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da empresa" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (identificador único)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="empresa-abc" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !nome.trim() || !slug.trim()}>
              {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
