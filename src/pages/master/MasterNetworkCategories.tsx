import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Globe, RefreshCw, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NetworkCategory {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  tipos_estabelecimento: string[];
  ativo: boolean;
  created_at: string;
}

export default function MasterNetworkCategories() {
  const [categories, setCategories] = useState<NetworkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NetworkCategory | null>(null);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipos, setTipos] = useState<string[]>([]);
  const [newTipo, setNewTipo] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("network_categories").select("*").order("nome");
    if (data) setCategories(data as any[]);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    if (!nome.trim() || !slug.trim()) return;
    setSaving(true);
    const payload = {
      nome: nome.trim(),
      slug: slug.trim(),
      descricao: descricao.trim() || null,
      tipos_estabelecimento: tipos,
    };
    if (editing) {
      const { error } = await supabase.from("network_categories").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Categoria atualizada!" });
    } else {
      const { error } = await supabase.from("network_categories").insert(payload);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Categoria criada!" });
    }
    setSaving(false);
    closeDialog();
    fetchCategories();
  };

  const handleToggle = async (cat: NetworkCategory, ativo: boolean) => {
    await supabase.from("network_categories").update({ ativo }).eq("id", cat.id);
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ativo } : c));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("network_categories").delete().eq("id", id);
    fetchCategories();
    toast({ title: "Categoria excluída" });
  };

  const openEdit = (c: NetworkCategory) => {
    setEditing(c);
    setNome(c.nome);
    setSlug(c.slug);
    setDescricao(c.descricao || "");
    setTipos(c.tipos_estabelecimento || []);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setNome("");
    setSlug("");
    setDescricao("");
    setTipos([]);
    setNewTipo("");
  };

  const addTipo = () => {
    if (!newTipo.trim()) return;
    setTipos(prev => [...prev, newTipo.trim()]);
    setNewTipo("");
  };

  const removeTipo = (idx: number) => {
    setTipos(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Categorias de Network
          </h1>
          <p className="text-muted-foreground">Gerencie as categorias disponíveis para os administradores no módulo Network.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchCategories}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => { closeDialog(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Categoria</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria de network cadastrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Tipos de Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.slug}</code></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(c.tipos_estabelecimento || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                        {(c.tipos_estabelecimento || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{c.tipos_estabelecimento.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Switch checked={c.ativo} onCheckedChange={(v) => handleToggle(c, v)} />
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>Defina o nome, slug e os tipos de estabelecimento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Hotéis e Resorts" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="hoteis" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição opcional..." />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Tipos de Estabelecimento</label>
              <p className="text-xs text-muted-foreground">Subtipos que aparecerão para seleção ao cadastrar um contato nesta categoria.</p>

              {tipos.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {tipos.map((t, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm">{t}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeTipo(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newTipo}
                  onChange={(e) => setNewTipo(e.target.value)}
                  placeholder="Ex: Hotel, Resort, Pousada..."
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTipo(); } }}
                />
                <Button variant="outline" onClick={addTipo} disabled={!newTipo.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !nome.trim() || !slug.trim()}>
              {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
