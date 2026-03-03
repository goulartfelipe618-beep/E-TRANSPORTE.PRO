import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Check, Link, Trash2, Save, Eye, Zap, Power, Plus, ArrowLeft, Settings2, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Automacao {
  id: string;
  nome: string;
  tipo: string;
  webhook_enabled: boolean;
  mapping: Record<string, string>;
  created_at: string;
}

const TIPOS_AUTOMACAO: Record<string, string> = {
  transfer_executivo: "Transfer Executivo",
  solicitacao_motorista: "Solicitação Motorista",
  solicitacao_grupo: "Solicitação de Grupo",
};

const getTipoLabel = (tipo: string) => {
  if (tipo.startsWith("leads_campanha:")) return "Leads Campanha";
  return TIPOS_AUTOMACAO[tipo] || tipo;
};

interface WebhookTest {
  id: string;
  label: string;
  payload: Record<string, unknown>;
  created_at: string;
  automacao_id: string | null;
}

/* ── Field groups for Transfer ── */
const transferFieldGroups = {
  comum: [
    { key: "tipo_viagem", label: "Tipo de Viagem" },
    { key: "cliente_nome", label: "Nome do Cliente" },
    { key: "cliente_telefone", label: "Telefone do Cliente" },
    { key: "cliente_email", label: "E-mail do Cliente" },
    { key: "cliente_origem", label: "Origem / Como encontrou" },
  ],
  somente_ida: [
    { key: "ida_passageiros", label: "Passageiros (Ida)" },
    { key: "ida_embarque", label: "Embarque (Ida)" },
    { key: "ida_destino", label: "Destino (Ida)" },
    { key: "ida_data", label: "Data (Ida)" },
    { key: "ida_hora", label: "Hora (Ida)" },
    { key: "ida_mensagem", label: "Mensagem (Ida)" },
    { key: "ida_cupom", label: "Cupom (Ida)" },
  ],
  ida_e_volta: [
    { key: "ida_passageiros", label: "Passageiros (Ida)" },
    { key: "ida_embarque", label: "Embarque (Ida)" },
    { key: "ida_destino", label: "Destino (Ida)" },
    { key: "ida_data", label: "Data (Ida)" },
    { key: "ida_hora", label: "Hora (Ida)" },
    { key: "ida_mensagem", label: "Mensagem (Ida)" },
    { key: "ida_cupom", label: "Cupom (Ida)" },
    { key: "volta_passageiros", label: "Passageiros (Volta)" },
    { key: "volta_embarque", label: "Embarque (Volta)" },
    { key: "volta_destino", label: "Destino (Volta)" },
    { key: "volta_data", label: "Data (Volta)" },
    { key: "volta_hora", label: "Hora (Volta)" },
    { key: "volta_mensagem", label: "Mensagem (Volta)" },
  ],
  por_hora: [
    { key: "por_hora_passageiros", label: "Passageiros" },
    { key: "por_hora_endereco_inicio", label: "Endereço de Início" },
    { key: "por_hora_data", label: "Data" },
    { key: "por_hora_hora", label: "Hora" },
    { key: "por_hora_qtd_horas", label: "Qtd. Horas" },
    { key: "por_hora_ponto_encerramento", label: "Ponto de Encerramento" },
    { key: "por_hora_itinerario", label: "Itinerário / Mensagem" },
    { key: "por_hora_cupom", label: "Cupom" },
  ],
};

/* ── Field groups for Motorista ── */
const motoristaFieldGroups = [
  { key: "nome_completo", label: "Nome Completo" },
  { key: "cpf", label: "CPF" },
  { key: "telefone", label: "Telefone" },
  { key: "email", label: "E-mail" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado (UF)" },
  { key: "cnh_numero", label: "Número da CNH" },
  { key: "cnh_categoria", label: "Categoria da CNH" },
  { key: "possui_veiculo", label: "Possui Veículo (sim/não)" },
  { key: "veiculo_marca", label: "Marca do Veículo" },
  { key: "veiculo_modelo", label: "Modelo do Veículo" },
  { key: "veiculo_ano", label: "Ano do Veículo" },
  { key: "veiculo_placa", label: "Placa do Veículo" },
  { key: "experiencia", label: "Experiência" },
  { key: "mensagem", label: "Mensagem / Observações" },
];

const leadsFieldGroups = [
  { key: "nome", label: "Nome do Lead" },
  { key: "email", label: "E-mail" },
  { key: "telefone", label: "Telefone / WhatsApp" },
  { key: "observacoes", label: "Observações / Mensagem" },
];

/* ── Field groups for Grupos ── */
const gruposFieldGroups = [
  { key: "tipo_veiculo", label: "Tipo de Veículo" },
  { key: "numero_passageiros", label: "Número de Passageiros" },
  { key: "endereco_embarque", label: "Endereço de Embarque" },
  { key: "destino", label: "Destino" },
  { key: "data_ida", label: "Data de Ida" },
  { key: "hora_ida", label: "Hora de Ida" },
  { key: "data_retorno", label: "Data de Retorno" },
  { key: "hora_retorno", label: "Hora de Retorno" },
  { key: "observacoes", label: "Observações" },
  { key: "cupom", label: "Cupom de Desconto" },
  { key: "cliente_nome", label: "Nome do Cliente" },
  { key: "cliente_email", label: "E-mail do Cliente" },
  { key: "cliente_whatsapp", label: "WhatsApp do Cliente" },
  { key: "cliente_origem", label: "Como nos encontrou" },
];

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    keys.push(fullKey);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, fullKey));
    }
  }
  return keys;
}

function resolveValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let val: any = obj;
  for (const p of parts) {
    if (val == null) return undefined;
    val = val[p];
  }
  return val;
}

export default function AutomacoesPage() {
  const [automacoes, setAutomacoes] = useState<Automacao[]>([]);
  const [selected, setSelected] = useState<Automacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTipo, setNewTipo] = useState("");
  const [creating, setCreating] = useState(false);
  const [campanhaOptions, setCampanhaOptions] = useState<{ id: string; nome: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("campanhas").select("id, nome").order("nome");
      if (data) setCampanhaOptions(data);
    })();
  }, []);

  const fetchAutomacoes = async () => {
    const { data } = await supabase
      .from("automacoes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAutomacoes(data.map((a: any) => ({ ...a, mapping: (a.mapping as Record<string, string>) || {} })));
    setLoading(false);
  };

  useEffect(() => { fetchAutomacoes(); }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newTipo) return;
    setCreating(true);
    const { error } = await supabase.from("automacoes").insert({ nome: newName.trim(), tipo: newTipo });
    if (error) {
      toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Automação criada!" });
      setNewName("");
      setNewTipo("");
      setCreateOpen(false);
      fetchAutomacoes();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("webhook_tests").delete().eq("automacao_id", id);
    await supabase.from("automacoes").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    fetchAutomacoes();
    toast({ title: "Automação excluída" });
  };

  const handleToggle = async (automacao: Automacao, enabled: boolean) => {
    await supabase.from("automacoes").update({ webhook_enabled: enabled }).eq("id", automacao.id);
    setAutomacoes((prev) => prev.map((a) => a.id === automacao.id ? { ...a, webhook_enabled: enabled } : a));
    if (selected?.id === automacao.id) setSelected({ ...automacao, webhook_enabled: enabled });
    toast({ title: enabled ? "Webhook ativado!" : "Webhook desativado!" });
  };

  if (selected) {
    return (
      <AutomacaoDetail
        automacao={selected}
        onBack={() => { setSelected(null); fetchAutomacoes(); }}
        onToggle={(enabled) => handleToggle(selected, enabled)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automações</h1>
          <p className="text-muted-foreground">Gerencie seus webhooks e mapeamentos de campos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { setLoading(true); fetchAutomacoes(); }} title="Recarregar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Automação
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : automacoes.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhuma automação criada.</p>
              <p className="text-muted-foreground text-sm">Clique em "Nova Automação" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>Nome</TableHead>
                   <TableHead>Tipo</TableHead>
                   <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automacoes.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        {a.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {getTipoLabel(a.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.webhook_enabled ? "default" : "secondary"}>
                        {a.webhook_enabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Switch
                          checked={a.webhook_enabled}
                          onCheckedChange={(v) => handleToggle(a, v)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => setSelected(a)} title="Configurar">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
                              <AlertDialogDescription>Todos os testes associados também serão removidos.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(a.id)}>Excluir</AlertDialogAction>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Automação</DialogTitle>
            <DialogDescription>Dê um nome e selecione o tipo de automação.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome da Automação</label>
              <Input
                placeholder="Ex: Formulário do site principal"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de Automação</label>
              <Select value={newTipo} onValueChange={setNewTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem disabled value="__header_master__">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Categorias do Sistema</span>
                  </SelectItem>
                  <SelectItem value="transfer_executivo">Transfer Executivo</SelectItem>
                  <SelectItem value="solicitacao_motorista">Solicitação Motorista</SelectItem>
                  <SelectItem value="solicitacao_grupo">Solicitação de Grupo</SelectItem>
                  {campanhaOptions.length > 0 && (
                    <>
                      <SelectItem disabled value="__header_campanhas__">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Campanhas (auto-criadas)</span>
                      </SelectItem>
                      {campanhaOptions.map((c) => (
                        <SelectItem key={c.id} value={`leads_campanha:${c.id}`}>{c.nome}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim() || !newTipo}>
              {creating ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────────────────────── DETAIL VIEW ────────────────────────── */

function AutomacaoDetail({
  automacao,
  onBack,
  onToggle,
}: {
  automacao: Automacao;
  onBack: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const [tests, setTests] = useState<WebhookTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<WebhookTest | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>(automacao.mapping);
  const [saving, setSaving] = useState(false);
  const [loadingTests, setLoadingTests] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(automacao.tipo === "solicitacao_motorista" || automacao.tipo === "solicitacao_grupo" ? "motorista" : "somente_ida");
  const { toast } = useToast();

  const isMotorista = automacao.tipo === "solicitacao_motorista";
  const isGrupo = automacao.tipo === "solicitacao_grupo";
  const isLeadsCampanha = automacao.tipo.startsWith("leads_campanha:");
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-solicitacao?automacao_id=${automacao.id}`;

  const availableVars = useMemo(() => {
    if (!selectedTest) return [];
    return flattenKeys(selectedTest.payload);
  }, [selectedTest]);

  const fetchTests = async () => {
    setLoadingTests(true);
    const { data } = await supabase
      .from("webhook_tests")
      .select("*")
      .eq("automacao_id", automacao.id)
      .order("created_at", { ascending: false });
    if (data) setTests(data as WebhookTest[]);
    setLoadingTests(false);
  };

  useEffect(() => { fetchTests(); }, [automacao.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteTest = async (id: string) => {
    await supabase.from("webhook_tests").delete().eq("id", id);
    if (selectedTest?.id === id) setSelectedTest(null);
    setTests((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Teste excluído" });
  };

  const handleSetVar = (fieldKey: string, varName: string) => {
    setMapping((prev) => ({ ...prev, [fieldKey]: varName === "__clear__" ? "" : varName }));
  };

  const handleSaveMapping = async () => {
    setSaving(true);
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(mapping)) {
      if (v) clean[k] = v;
    }
    await supabase.from("automacoes").update({ mapping: clean }).eq("id", automacao.id);
    toast({ title: "Mapeamento salvo!" });
    setSaving(false);
  };

  const renderVarSelect = (field: { key: string; label: string }) => (
    <div key={field.key} className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{field.label}</label>
      <Select
        value={mapping[field.key] || ""}
        onValueChange={(v) => handleSetVar(field.key, v)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Selecione a variável..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__clear__">
            <span className="text-muted-foreground">— Nenhuma —</span>
          </SelectItem>
          {availableVars
            .filter((v) => {
              const val = resolveValue(selectedTest!.payload, v);
              return typeof val !== "object" || val === null;
            })
            .map((v) => (
              <SelectItem key={v} value={v}>
                <span className="font-mono text-xs">{v}</span>
                <span className="ml-2 text-muted-foreground text-xs">
                  = {String(resolveValue(selectedTest!.payload, v) ?? "")}
                </span>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {mapping[field.key] && (
        <p className="text-xs text-muted-foreground">
          Mapeado para: <code className="bg-muted px-1 rounded">{mapping[field.key]}</code>
          {" → "}
          <span className="text-foreground font-medium">
            {String(resolveValue(selectedTest!.payload, mapping[field.key]) ?? "—")}
          </span>
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{automacao.nome}</h1>
          <p className="text-muted-foreground text-sm">Configure o webhook e mapeamento de campos.</p>
        </div>
      </div>

      {/* Webhook URL + Toggle */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">URL do Webhook:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{webhookUrl}</code>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <Power className={`h-4 w-4 ${automacao.webhook_enabled ? "text-green-500" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Webhook {automacao.webhook_enabled ? "Ativado" : "Desativado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {automacao.webhook_enabled
                    ? isLeadsCampanha
                      ? "Envios criam leads na campanha associada com o mapeamento configurado."
                      : isMotorista
                        ? "Envios criam solicitações de motorista com o mapeamento configurado."
                        : isGrupo
                          ? "Envios criam solicitações de grupo com o mapeamento configurado."
                          : "Envios criam solicitações de transfer com o mapeamento configurado."
                    : "Envios são salvos como testes para configurar o mapeamento."}
                </p>
              </div>
            </div>
            <Switch checked={automacao.webhook_enabled} onCheckedChange={onToggle} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Tests */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Testes Recebidos
                </CardTitle>
                <Button variant="outline" size="icon" onClick={fetchTests} title="Recarregar testes">
                  <RefreshCw className={`h-4 w-4 ${loadingTests ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTests ? (
                <p className="text-muted-foreground text-sm">Carregando...</p>
              ) : tests.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum teste recebido. Desative o webhook e envie uma requisição POST para a URL acima.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.map((t) => (
                      <TableRow key={t.id} className={selectedTest?.id === t.id ? "bg-primary/10" : "cursor-pointer"}>
                        <TableCell className="font-medium">{t.label}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(t.created_at).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant={selectedTest?.id === t.id ? "default" : "ghost"}
                              size="icon"
                              onClick={() => setSelectedTest(t)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir teste?</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTest(t.id)}>Excluir</AlertDialogAction>
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

          {selectedTest && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Variáveis — {selectedTest.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {availableVars.map((varKey) => {
                    const val = resolveValue(selectedTest.payload, varKey);
                    if (typeof val === "object" && val !== null) return null;
                    const strVal = String(val ?? "");
                    const isUrl = strVal.startsWith("http://") || strVal.startsWith("https://");
                    const isImage = isUrl && /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(strVal);
                    return (
                      <div key={varKey} className="flex flex-col gap-1 py-1.5 px-2 rounded bg-muted/50 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="font-mono text-xs shrink-0">{varKey}</Badge>
                          {isUrl ? (
                            <a href={strVal} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate text-right text-xs max-w-[200px]">
                              {varKey.endsWith("__filename") ? strVal : "Ver arquivo ↗"}
                            </a>
                          ) : (
                            <span className="text-foreground truncate text-right">{strVal}</span>
                          )}
                        </div>
                        {isImage && (
                          <img src={strVal} alt={varKey} className="h-16 w-auto rounded border object-cover mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Mapping */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Mapeamento de Campos</CardTitle>
              <Button size="sm" onClick={handleSaveMapping} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
             {!selectedTest ? (
              <p className="text-muted-foreground text-sm">
                Selecione um teste recebido para visualizar as variáveis disponíveis e configurar o mapeamento.
              </p>
            ) : isLeadsCampanha ? (
              /* ── Leads Campanha mapping ── */
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {leadsFieldGroups.map(renderVarSelect)}
              </div>
            ) : isMotorista ? (
              /* ── Motorista mapping: single list ── */
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {motoristaFieldGroups.map(renderVarSelect)}
              </div>
            ) : isGrupo ? (
              /* ── Grupo mapping: single list ── */
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {gruposFieldGroups.map(renderVarSelect)}
              </div>
            ) : (
              /* ── Transfer mapping: tabbed ── */
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="somente_ida">Somente Ida</TabsTrigger>
                  <TabsTrigger value="ida_e_volta">Ida e Volta</TabsTrigger>
                  <TabsTrigger value="por_hora">Por Hora</TabsTrigger>
                </TabsList>
                {["somente_ida", "ida_e_volta", "por_hora"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {[...transferFieldGroups.comum, ...transferFieldGroups[tab as keyof typeof transferFieldGroups]].map(renderVarSelect)}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
