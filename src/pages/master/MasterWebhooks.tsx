import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Trash2, Edit, RefreshCw, Webhook, Copy, Check, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/* ───── Categorias fixas do sistema (serviços de solicitação do admin) ───── */
const SYSTEM_CATEGORIES = [
  { value: "website", label: "Criação de Website" },
  { value: "dominio", label: "Registro de Domínio" },
  { value: "email", label: "Criação de E-mail" },
  { value: "comunicador", label: "Criação de Comunicador" },
  { value: "usuario", label: "Criação de Usuário" },
  { value: "google_business", label: "Conta Google Business" },
];

interface WebhookRow {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  webhook_slug: string;
  recebimento_ativo: boolean;
  webhook_url_envio: string | null;
  envio_ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function MasterWebhooks() {
  const [rows, setRows] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WebhookRow | null>(null);

  // Form
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [webhookUrlEnvio, setWebhookUrlEnvio] = useState("");
  const [envioAtivo, setEnvioAtivo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic categories from automation_categories
  const [dynamicCategories, setDynamicCategories] = useState<{ value: string; label: string }[]>([]);

  const { toast } = useToast();

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "pklrgeqnckzphzwrhlnr";

  const allCategories = useMemo(() => {
    const merged = [...SYSTEM_CATEGORIES];
    for (const dc of dynamicCategories) {
      if (!merged.find((c) => c.value === dc.value)) {
        merged.push(dc);
      }
    }
    return merged;
  }, [dynamicCategories]);

  const buildReceiveUrl = (slug: string) =>
    `https://${projectId}.supabase.co/functions/v1/master-webhook/${slug}`;

  const fetchData = async () => {
    setLoading(true);
    const [{ data: wh }, { data: cats }] = await Promise.all([
      supabase.from("master_webhooks").select("*").order("created_at", { ascending: false }),
      supabase.from("automation_categories").select("slug, nome").eq("ativo", true),
    ]);
    if (wh) setRows(wh as WebhookRow[]);
    if (cats) {
      setDynamicCategories(
        (cats as any[]).map((c) => ({ value: c.slug, label: c.nome }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setNome("");
    setCategoria("");
    setDescricao("");
    setWebhookUrlEnvio("");
    setEnvioAtivo(false);
  };

  const openEdit = (r: WebhookRow) => {
    setEditing(r);
    setNome(r.nome);
    setCategoria(r.categoria);
    setDescricao(r.descricao || "");
    setWebhookUrlEnvio(r.webhook_url_envio || "");
    setEnvioAtivo(r.envio_ativo);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !categoria) return;
    setSaving(true);
    const payload: any = {
      nome: nome.trim(),
      categoria,
      descricao: descricao.trim() || null,
      webhook_url_envio: webhookUrlEnvio.trim() || null,
      envio_ativo: envioAtivo,
    };

    if (editing) {
      const { error } = await supabase
        .from("master_webhooks")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Webhook atualizado!" });
      }
    } else {
      const { error } = await supabase.from("master_webhooks").insert(payload);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Webhook criado!" });
      }
    }
    setSaving(false);
    closeDialog();
    fetchData();
  };

  const handleToggleRecebimento = async (row: WebhookRow, val: boolean) => {
    await supabase.from("master_webhooks").update({ recebimento_ativo: val }).eq("id", row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, recebimento_ativo: val } : r)));
  };

  const handleToggleEnvio = async (row: WebhookRow, val: boolean) => {
    await supabase.from("master_webhooks").update({ envio_ativo: val }).eq("id", row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, envio_ativo: val } : r)));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("master_webhooks").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    fetchData();
    toast({ title: "Webhook excluído" });
  };

  const copyUrl = (slug: string, id: string) => {
    navigator.clipboard.writeText(buildReceiveUrl(slug));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "URL copiada!" });
  };

  const getCatLabel = (val: string) =>
    allCategories.find((c) => c.value === val)?.label || val;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie links de recebimento e envio de dados por categoria de serviço.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { closeDialog(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Webhook
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <Webhook className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum webhook cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>URL de Recebimento</TableHead>
                  <TableHead className="text-center">Recebimento</TableHead>
                  <TableHead className="text-center">Envio</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCatLabel(r.categoria)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 max-w-xs">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate block max-w-[220px]">
                          {buildReceiveUrl(r.webhook_slug)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => copyUrl(r.webhook_slug, r.id)}
                        >
                          {copiedId === r.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={r.recebimento_ativo}
                        onCheckedChange={(v) => handleToggleRecebimento(r, v)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Switch
                          checked={r.envio_ativo}
                          onCheckedChange={(v) => handleToggleEnvio(r, v)}
                          disabled={!r.webhook_url_envio}
                        />
                        {r.webhook_url_envio && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px] block">
                            {r.webhook_url_envio}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir webhook?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(r.id)}>
                                Excluir
                              </AlertDialogAction>
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

      {/* ───── Dialog Criar/Editar ───── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
            <DialogDescription>
              Configure o webhook de recebimento e envio de dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Webhook</label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Solicitações de Website"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                As categorias são os serviços de solicitação do painel do administrador.
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição opcional..."
                rows={2}
              />
            </div>

            {/* URL de recebimento (somente leitura quando editando) */}
            {editing && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  URL de Recebimento
                  <Badge variant={editing.recebimento_ativo ? "default" : "secondary"} className="text-xs">
                    {editing.recebimento_ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={buildReceiveUrl(editing.webhook_slug)}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyUrl(editing.webhook_slug, editing.id)}
                  >
                    {copiedId === editing.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Webhook de Envio */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Webhook de Envio (Forwarding)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {envioAtivo ? "Ativo" : "Inativo"}
                  </span>
                  <Switch checked={envioAtivo} onCheckedChange={setEnvioAtivo} />
                </div>
              </div>
              <Input
                value={webhookUrlEnvio}
                onChange={(e) => setWebhookUrlEnvio(e.target.value)}
                placeholder="https://exemplo.com/webhook"
              />
              <p className="text-xs text-muted-foreground">
                Quando ativado, os dados recebidos serão automaticamente enviados para esta URL.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !nome.trim() || !categoria}>
              {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
