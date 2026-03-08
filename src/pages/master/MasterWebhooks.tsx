import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Plus, Trash2, Edit, RefreshCw, Webhook, Copy, Check, ExternalLink, MessageSquare, Zap, Settings2, Radio,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/* ───── Categorias fixas do sistema ───── */
const SYSTEM_CATEGORIES = [
  { value: "website", label: "Criação de Website" },
  { value: "dominio", label: "Registro de Domínio" },
  { value: "email", label: "Criação de E-mail" },
  { value: "comunicador", label: "Criação de Comunicador" },
  { value: "usuario", label: "Criação de Usuário" },
  { value: "google_business", label: "Conta Google Business" },
];

interface AutoComunicarConfig {
  comunicador_id?: string;
  saudacao?: string;
  mensagem_adicional?: string;
}

interface WebhookRow {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  webhook_slug: string;
  recebimento_ativo: boolean;
  webhook_url_envio: string | null;
  envio_ativo: boolean;
  auto_comunicar: boolean;
  auto_comunicar_config: AutoComunicarConfig;
  created_at: string;
  updated_at: string;
}

interface Comunicador {
  id: string;
  nome: string;
  webhook_url: string;
  descricao: string | null;
  ativo: boolean;
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
  const [autoComunicar, setAutoComunicar] = useState(false);
  const [autoComunicarConfig, setAutoComunicarConfig] = useState<AutoComunicarConfig>({});
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-comunicar config dialog (inline from table)
  const [autoConfigDialogOpen, setAutoConfigDialogOpen] = useState(false);
  const [autoConfigRow, setAutoConfigRow] = useState<WebhookRow | null>(null);
  const [autoConfigEnabled, setAutoConfigEnabled] = useState(false);
  const [autoConfigData, setAutoConfigData] = useState<AutoComunicarConfig>({});
  const [autoConfigSaving, setAutoConfigSaving] = useState(false);

  // Dynamic categories
  const [dynamicCategories, setDynamicCategories] = useState<{ value: string; label: string }[]>([]);

  // Comunicadores for auto-comunicar
  const [comunicadores, setComunicadores] = useState<Comunicador[]>([]);

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
    const [{ data: wh }, { data: cats }, { data: comuns }] = await Promise.all([
      supabase.from("master_webhooks").select("*").order("created_at", { ascending: false }),
      supabase.from("automation_categories").select("slug, nome").eq("ativo", true),
      supabase.from("comunicadores").select("*").eq("ativo", true).is("tenant_id", null).order("created_at"),
    ]);
    if (wh) setRows(wh.map((r: any) => ({
      ...r,
      auto_comunicar: r.auto_comunicar ?? false,
      auto_comunicar_config: (r.auto_comunicar_config && typeof r.auto_comunicar_config === "object") ? r.auto_comunicar_config : {},
    })) as WebhookRow[]);
    if (cats) {
      setDynamicCategories(
        (cats as any[]).map((c) => ({ value: c.slug, label: c.nome }))
      );
    }
    if (comuns) setComunicadores(comuns as Comunicador[]);
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
    setAutoComunicar(false);
    setAutoComunicarConfig({});
  };

  const openEdit = (r: WebhookRow) => {
    setEditing(r);
    setNome(r.nome);
    setCategoria(r.categoria);
    setDescricao(r.descricao || "");
    setWebhookUrlEnvio(r.webhook_url_envio || "");
    setEnvioAtivo(r.envio_ativo);
    setAutoComunicar(r.auto_comunicar);
    setAutoComunicarConfig(r.auto_comunicar_config || {});
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
      auto_comunicar: autoComunicar,
      auto_comunicar_config: autoComunicar ? autoComunicarConfig : {},
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

  const getComunicadorName = (id?: string) =>
    comunicadores.find((c) => c.id === id)?.nome;

  // ── Auto Config Dialog (quick config from table) ──
  const openAutoConfigDialog = (row: WebhookRow) => {
    setAutoConfigRow(row);
    setAutoConfigEnabled(row.auto_comunicar);
    setAutoConfigData(row.auto_comunicar_config || {});
    setAutoConfigDialogOpen(true);
  };

  const handleSaveAutoConfig = async () => {
    if (!autoConfigRow) return;
    setAutoConfigSaving(true);

    const configToSave = autoConfigEnabled ? autoConfigData : {};
    const { error } = await supabase
      .from("master_webhooks")
      .update({
        auto_comunicar: autoConfigEnabled,
        auto_comunicar_config: configToSave as any,
      })
      .eq("id", autoConfigRow.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: autoConfigEnabled ? "Comunicação automática ativada!" : "Comunicação automática desativada!" });
      setRows((prev) =>
        prev.map((r) =>
          r.id === autoConfigRow.id
            ? { ...r, auto_comunicar: autoConfigEnabled, auto_comunicar_config: configToSave as AutoComunicarConfig }
            : r
        )
      );
    }
    setAutoConfigSaving(false);
    setAutoConfigDialogOpen(false);
    setAutoConfigRow(null);
  };

  const autoConfigPreview = useMemo(() => {
    if (!autoConfigEnabled) return "";
    const parts: string[] = [];
    if (autoConfigData.saudacao?.trim()) parts.push(autoConfigData.saudacao.trim());
    parts.push("\n📋 *Dados da solicitação serão inseridos aqui automaticamente*");
    if (autoConfigData.mensagem_adicional?.trim()) parts.push("\n" + autoConfigData.mensagem_adicional.trim());
    return parts.join("\n");
  }, [autoConfigEnabled, autoConfigData]);

  // Preview of auto message (for main dialog)
  const autoMessagePreview = useMemo(() => {
    if (!autoComunicar) return "";
    const parts: string[] = [];
    if (autoComunicarConfig.saudacao?.trim()) parts.push(autoComunicarConfig.saudacao.trim());
    parts.push("\n📋 *Dados da solicitação serão inseridos aqui automaticamente*");
    if (autoComunicarConfig.mensagem_adicional?.trim()) parts.push("\n" + autoComunicarConfig.mensagem_adicional.trim());
    return parts.join("\n");
  }, [autoComunicar, autoComunicarConfig]);

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
                  <TableHead className="text-center">Automação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const comName = getComunicadorName(r.auto_comunicar_config?.comunicador_id);
                  const isAutoConfigured = !!r.auto_comunicar_config?.comunicador_id;

                  return (
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
                      {/* ── Automação column ── */}
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => openAutoConfigDialog(r)}
                          className={`inline-flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            r.auto_comunicar && isAutoConfigured
                              ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                              : "border-border bg-transparent hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {r.auto_comunicar && isAutoConfigured ? (
                              <Zap className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className={`text-xs font-medium ${
                              r.auto_comunicar && isAutoConfigured ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {r.auto_comunicar && isAutoConfigured ? "Ativado" : "Desativado"}
                            </span>
                          </div>
                          {r.auto_comunicar && isAutoConfigured && comName && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              via {comName}
                            </span>
                          )}
                          {!isAutoConfigured && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Settings2 className="h-2.5 w-2.5" /> Configurar
                            </span>
                          )}
                        </button>
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ───── Dialog Quick Auto Config ───── */}
      <Dialog open={autoConfigDialogOpen} onOpenChange={(v) => { if (!v) { setAutoConfigDialogOpen(false); setAutoConfigRow(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Comunicação Automática
            </DialogTitle>
            <DialogDescription>
              {autoConfigRow?.nome} — {getCatLabel(autoConfigRow?.categoria || "")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toggle principal */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Status da Automação</p>
                <p className="text-xs text-muted-foreground">
                  {autoConfigEnabled
                    ? "Toda solicitação recebida será comunicada automaticamente"
                    : "Solicitações são recebidas normalmente, comunicação é manual"}
                </p>
              </div>
              <Switch checked={autoConfigEnabled} onCheckedChange={setAutoConfigEnabled} />
            </div>

            {autoConfigEnabled && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                {/* Selecionar comunicador */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selecione o Comunicador</Label>
                  {comunicadores.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-border text-center">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Nenhum comunicador ativo disponível. Configure no menu Comunicador.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {comunicadores.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setAutoConfigData(prev => ({ ...prev, comunicador_id: c.id }))}
                          className={`w-full text-left border rounded-lg p-3 transition-all text-sm ${
                            autoConfigData.comunicador_id === c.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{c.nome}</span>
                            {autoConfigData.comunicador_id === c.id && (
                              <Badge variant="default" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Selecionado
                              </Badge>
                            )}
                          </div>
                          {c.descricao && <p className="text-xs text-muted-foreground mt-0.5">{c.descricao}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saudação */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mensagem de Saudação</Label>
                  <Textarea
                    value={autoConfigData.saudacao || ""}
                    onChange={(e) => setAutoConfigData(prev => ({ ...prev, saudacao: e.target.value }))}
                    placeholder="Ex: 🔔 Nova solicitação recebida!"
                    rows={2}
                  />
                </div>

                {/* Mensagem adicional */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mensagem Final (após os dados)</Label>
                  <Textarea
                    value={autoConfigData.mensagem_adicional || ""}
                    onChange={(e) => setAutoConfigData(prev => ({ ...prev, mensagem_adicional: e.target.value }))}
                    placeholder="Ex: Entre em contato o mais rápido possível."
                    rows={2}
                  />
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pré-visualização da Mensagem</Label>
                  <div className="border border-border rounded-lg p-3 bg-muted/30 text-xs whitespace-pre-wrap font-mono max-h-40 overflow-y-auto text-foreground">
                    {autoConfigPreview || <span className="text-muted-foreground italic">Configure a mensagem acima</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAutoConfigDialogOpen(false); setAutoConfigRow(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAutoConfig}
              disabled={autoConfigSaving || (autoConfigEnabled && !autoConfigData.comunicador_id)}
            >
              {autoConfigSaving ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Dialog Criar/Editar ───── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
            <DialogDescription>
              Configure o webhook de recebimento, envio e comunicação automática.
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

            {/* URL de recebimento */}
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

            {/* ───── Auto Comunicar ───── */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <label className="text-sm font-medium">Comunicação Automática</label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {autoComunicar ? "Ativo" : "Inativo"}
                  </span>
                  <Switch checked={autoComunicar} onCheckedChange={setAutoComunicar} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Quando ativado, toda solicitação recebida será automaticamente enviada via comunicador com a mensagem predefinida abaixo.
              </p>

              {autoComunicar && (
                <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                  {/* Selecionar comunicador */}
                  <div className="space-y-2">
                    <Label className="text-sm">Comunicador</Label>
                    {comunicadores.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Nenhum comunicador ativo disponível. Configure no menu Comunicador.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {comunicadores.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setAutoComunicarConfig(prev => ({ ...prev, comunicador_id: c.id }))}
                            className={`w-full text-left border rounded-lg p-2.5 transition-colors text-sm ${
                              autoComunicarConfig.comunicador_id === c.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{c.nome}</span>
                              {autoComunicarConfig.comunicador_id === c.id && (
                                <Badge variant="default" className="text-xs">Selecionado</Badge>
                              )}
                            </div>
                            {c.descricao && <p className="text-xs text-muted-foreground mt-0.5">{c.descricao}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Saudação */}
                  <div className="space-y-2">
                    <Label className="text-sm">Mensagem de Saudação</Label>
                    <Textarea
                      value={autoComunicarConfig.saudacao || ""}
                      onChange={(e) => setAutoComunicarConfig(prev => ({ ...prev, saudacao: e.target.value }))}
                      placeholder="Ex: Olá, recebemos uma nova solicitação:"
                      rows={2}
                    />
                  </div>

                  {/* Mensagem adicional */}
                  <div className="space-y-2">
                    <Label className="text-sm">Mensagem Final (após os dados)</Label>
                    <Textarea
                      value={autoComunicarConfig.mensagem_adicional || ""}
                      onChange={(e) => setAutoComunicarConfig(prev => ({ ...prev, mensagem_adicional: e.target.value }))}
                      placeholder="Ex: Entre em contato o mais rápido possível."
                      rows={2}
                    />
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm">Pré-visualização</Label>
                    <div className="border border-border rounded-lg p-3 bg-muted/30 text-xs whitespace-pre-wrap font-mono max-h-32 overflow-y-auto text-foreground">
                      {autoMessagePreview || <span className="text-muted-foreground italic">Configure a mensagem acima</span>}
                    </div>
                  </div>
                </div>
              )}
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
