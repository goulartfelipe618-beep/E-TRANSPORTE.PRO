import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Layers3, RefreshCw, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Campo {
  key: string;
  label: string;
  type?: "text" | "image";
}

const BUILTIN_SLUGS = ["transfer_executivo", "solicitacao_motorista", "solicitacao_grupo", "leads"];

interface Category {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  campos: Campo[];
  ativo: boolean;
  created_at: string;
}

export default function MasterCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [descricao, setDescricao] = useState("");
  const [campos, setCampos] = useState<Campo[]>([]);
  const [newCampoKey, setNewCampoKey] = useState("");
  const [newCampoLabel, setNewCampoLabel] = useState("");
  const [newCampoType, setNewCampoType] = useState<"text" | "image">("text");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("automation_categories").select("*").order("nome");
    if (data) setCategories(data.map((c: any) => ({ ...c, campos: Array.isArray(c.campos) ? c.campos : [] })));
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    if (!nome.trim() || !slug.trim()) return;
    setSaving(true);
    const payload = { nome: nome.trim(), slug: slug.trim(), descricao: descricao.trim() || null, campos: campos as any };
    if (editing) {
      const { error } = await supabase.from("automation_categories").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Categoria atualizada!" });
    } else {
      const { error } = await supabase.from("automation_categories").insert(payload);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Categoria criada!" });
    }
    setSaving(false);
    closeDialog();
    fetchCategories();
  };

  const handleToggle = async (cat: Category, ativo: boolean) => {
    await supabase.from("automation_categories").update({ ativo }).eq("id", cat.id);
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ativo } : c));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("automation_categories").delete().eq("id", id);
    fetchCategories();
    toast({ title: "Categoria excluída" });
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setNome(c.nome);
    setSlug(c.slug);
    setDescricao(c.descricao || "");
    setCampos(c.campos);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setNome("");
    setSlug("");
    setDescricao("");
    setCampos([]);
    setNewCampoKey("");
    setNewCampoLabel("");
    setNewCampoType("text");
  };

  const addCampo = () => {
    if (!newCampoKey.trim() || !newCampoLabel.trim()) return;
    setCampos(prev => [...prev, { key: newCampoKey.trim(), label: newCampoLabel.trim(), type: newCampoType }]);
    setNewCampoKey("");
    setNewCampoLabel("");
    setNewCampoType("text");
  };

  const removeCampo = (idx: number) => {
    setCampos(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias de Automação</h1>
          <p className="text-muted-foreground">Defina as categorias e campos dos formulários de automação.</p>
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
              <Layers3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria cadastrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Campos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.nome}
                      {BUILTIN_SLUGS.includes(c.slug) && (
                        <Badge variant="outline" className="ml-2 text-xs">Sistema</Badge>
                      )}
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.slug}</code></TableCell>
                    <TableCell><Badge variant="outline">{c.campos.length} campos</Badge></TableCell>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>Defina o nome, slug e os campos do formulário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Transfer Executivo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="transfer_executivo" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição opcional..." rows={2} />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Campos do Formulário</label>
              <p className="text-xs text-muted-foreground">Estes campos aparecerão no lado direito da tela de automações para o painel do admin comum.</p>
              
              {campos.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {campos.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.key}</code>
                        <span className="text-sm">{c.label}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeCampo(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newCampoKey}
                  onChange={(e) => setNewCampoKey(e.target.value.replace(/[^a-z0-9_]/g, ""))}
                  placeholder="chave (ex: cliente_nome)"
                  className="flex-1"
                />
                <Input
                  value={newCampoLabel}
                  onChange={(e) => setNewCampoLabel(e.target.value)}
                  placeholder="Label (ex: Nome do Cliente)"
                  className="flex-1"
                />
                <Button variant="outline" onClick={addCampo} disabled={!newCampoKey.trim() || !newCampoLabel.trim()}>
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
