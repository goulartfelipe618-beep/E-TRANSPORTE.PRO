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
import { Copy, Check, Link, Trash2, Save, Eye, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebhookTest {
  id: string;
  label: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// All fields organized by trip type
const fieldGroups = {
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

// Flatten all payload keys recursively
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

export default function TransferAutomacao() {
  const [tests, setTests] = useState<WebhookTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<WebhookTest | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("somente_ida");
  const { toast } = useToast();

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-solicitacao`;

  // Available variable keys from the selected test
  const availableVars = useMemo(() => {
    if (!selectedTest) return [];
    return flattenKeys(selectedTest.payload);
  }, [selectedTest]);

  const fetchTests = async () => {
    const { data } = await supabase
      .from("webhook_tests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTests(data as WebhookTest[]);
    setLoading(false);
  };

  const fetchMapping = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "webhook_mapping")
      .single();
    if (data?.value) {
      try { setMapping(JSON.parse(data.value)); } catch {}
    }
  };

  useEffect(() => {
    fetchTests();
    fetchMapping();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteTest = async (id: string) => {
    await supabase.from("webhook_tests").delete().eq("id", id);
    if (selectedTest?.id === id) setSelectedTest(null);
    fetchTests();
    toast({ title: "Teste excluído" });
  };

  const handleSetVar = (fieldKey: string, varName: string) => {
    setMapping((prev) => ({
      ...prev,
      [fieldKey]: varName === "__clear__" ? "" : varName,
    }));
  };

  const handleSaveMapping = async () => {
    setSaving(true);
    // Clean empty values
    const cleanMapping: Record<string, string> = {};
    for (const [k, v] of Object.entries(mapping)) {
      if (v) cleanMapping[k] = v;
    }

    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", "webhook_mapping")
      .single();

    if (existing) {
      await supabase
        .from("system_settings")
        .update({ value: JSON.stringify(cleanMapping) })
        .eq("key", "webhook_mapping");
    } else {
      await supabase
        .from("system_settings")
        .insert({ key: "webhook_mapping", value: JSON.stringify(cleanMapping) });
    }

    toast({ title: "Mapeamento salvo!", description: "As próximas solicitações usarão esta configuração." });
    setSaving(false);
  };

  const currentFields = useMemo(() => {
    return [
      ...fieldGroups.comum,
      ...fieldGroups[activeTab as keyof typeof fieldGroups] || [],
    ];
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automação de Webhook</h1>
        <p className="text-muted-foreground">Configure o mapeamento entre variáveis do webhook e os campos de solicitação de transfer.</p>
      </div>

      {/* Webhook URL */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">URL do Webhook (use no formulário externo):</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{webhookUrl}</code>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Para enviar um <strong>teste</strong>, inclua o header <code className="bg-muted px-1 rounded">x-webhook-test: true</code> na requisição POST.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Tests received */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Testes Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Carregando...</p>
              ) : tests.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum teste recebido. Envie uma requisição POST com header <code className="bg-muted px-1 rounded text-xs">x-webhook-test: true</code>.
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
                      <TableRow
                        key={t.id}
                        className={selectedTest?.id === t.id ? "bg-primary/10" : "cursor-pointer"}
                      >
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
                              title="Usar variáveis deste teste"
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

          {/* Selected test payload */}
          {selectedTest && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Variáveis — {selectedTest.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {availableVars.map((varKey) => {
                    const val = resolveValue(selectedTest.payload, varKey);
                    if (typeof val === "object" && val !== null) return null;
                    return (
                      <div key={varKey} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-muted/50 text-sm">
                        <Badge variant="secondary" className="font-mono text-xs shrink-0">{varKey}</Badge>
                        <span className="text-foreground truncate text-right">{String(val ?? "")}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Mapping fields */}
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
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="somente_ida">Somente Ida</TabsTrigger>
                  <TabsTrigger value="ida_e_volta">Ida e Volta</TabsTrigger>
                  <TabsTrigger value="por_hora">Por Hora</TabsTrigger>
                </TabsList>

                {["somente_ida", "ida_e_volta", "por_hora"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {[...fieldGroups.comum, ...fieldGroups[tab as keyof typeof fieldGroups]].map((field) => (
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
                                  const val = resolveValue(selectedTest.payload, v);
                                  return typeof val !== "object" || val === null;
                                })
                                .map((v) => (
                                  <SelectItem key={v} value={v}>
                                    <span className="font-mono text-xs">{v}</span>
                                    <span className="ml-2 text-muted-foreground text-xs">
                                      = {String(resolveValue(selectedTest.payload, v) ?? "")}
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
                                {String(resolveValue(selectedTest.payload, mapping[field.key]) ?? "—")}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
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
