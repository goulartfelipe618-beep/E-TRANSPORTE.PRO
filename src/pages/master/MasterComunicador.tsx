import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RefreshCw, Save, Trash2, Plus, MessageSquare, Webhook, Pencil, Lock,
  QrCode, Loader2, CheckCircle,
} from "lucide-react";
import { Input as InputUI } from "@/components/ui/input";
import { Label as LabelUI } from "@/components/ui/label";

interface Comunicador {
  id: string;
  nome: string;
  webhook_url: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
}

const MAX_COMUNICADORES = 3;

export default function MasterComunicador() {
  const [comunicadores, setComunicadores] = useState<Comunicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

  // QR Code flow
  const [qrStep, setQrStep] = useState<"idle" | "generating" | "showing" | "confirming" | "connected">("idle");
  const [qrBase64, setQrBase64] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const fetchComunicadores = useCallback(async () => {
    setLoading(true);
    // Master comunicadores have tenant_id = null
    const { data, error } = await supabase
      .from("comunicadores")
      .select("*")
      .is("tenant_id", null)
      .order("created_at", { ascending: true });
    if (!error && data) setComunicadores(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchComunicadores(); }, [fetchComunicadores]);

  const handleGenerateQr = async () => {
    setQrStep("generating");
    const name = `master_${Date.now()}`;
    setInstanceName(name);

    try {
      const { data: createData, error: createErr } = await supabase.functions.invoke("evolution-proxy", {
        body: { action: "create_instance", instance_name: name },
      });
      if (createErr) throw createErr;

      const { data: qrData, error: qrErr } = await supabase.functions.invoke("evolution-proxy", {
        body: { action: "get_qrcode", instance_name: name },
      });
      if (qrErr) throw qrErr;

      const base64 = qrData?.base64 || qrData?.qrcode?.base64 || "";
      if (base64) {
        setQrBase64(base64);
        setQrStep("showing");
      } else {
        toast.error("QR Code não disponível. Tente novamente.");
        setQrStep("idle");
      }
    } catch (e: any) {
      console.error("QR error:", e);
      toast.error(e.message || "Erro ao gerar QR Code");
      setQrStep("idle");
    }
  };

  const handleConfirmConnection = async () => {
    setQrStep("confirming");
    try {
      const { data, error } = await supabase.functions.invoke("evolution-proxy", {
        body: { action: "check_status", instance_name: instanceName },
      });
      if (error) throw error;

      const state = data?.instance?.state || data?.state || "";
      if (state === "open" || state === "connected") {
        // Auto-register comunicador
        if (comunicadores.length >= MAX_COMUNICADORES) {
          toast.error(`Máximo de ${MAX_COMUNICADORES} comunicadores atingido`);
          setQrStep("showing");
          return;
        }
        const { error: insertErr } = await supabase.from("comunicadores").insert({
          nome: `WhatsApp ${comunicadores.length + 1}`,
          webhook_url: webhookUrl.trim() || "",
          descricao: `Instância: ${instanceName}`,
          ativo: true,
          tenant_id: null,
        });
        if (insertErr) throw insertErr;
        toast.success("WhatsApp conectado e comunicador registrado!");
        setQrStep("connected");
        setWebhookUrl("");
        fetchComunicadores();
      } else {
        toast.error("WhatsApp ainda não conectado. Escaneie o QR Code e tente novamente.");
        setQrStep("showing");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao confirmar conexão");
      setQrStep("showing");
    }
  };

  const handleAdd = async () => {
    if (comunicadores.length >= MAX_COMUNICADORES) {
      toast.error(`Máximo de ${MAX_COMUNICADORES} comunicadores permitidos`);
      return;
    }
    const { data, error } = await supabase.from("comunicadores").insert({
      nome: `Comunicador Master ${comunicadores.length + 1}`,
      webhook_url: "",
      descricao: "",
      ativo: false,
      tenant_id: null,
    }).select().single();
    if (error) toast.error("Erro ao adicionar");
    else {
      toast.success("Comunicador adicionado");
      setEditingIds((prev) => new Set(prev).add(data.id));
      fetchComunicadores();
    }
  };

  const handleSave = async (c: Comunicador) => {
    if (!c.webhook_url.trim()) {
      toast.error("Insira a URL do webhook");
      return;
    }
    const { error } = await supabase.from("comunicadores").update({
      nome: c.nome, webhook_url: c.webhook_url, descricao: c.descricao, ativo: c.ativo,
    }).eq("id", c.id);
    if (error) toast.error("Erro ao salvar");
    else {
      toast.success("Salvo com sucesso");
      setEditingIds((prev) => { const next = new Set(prev); next.delete(c.id); return next; });
    }
  };

  const handleToggle = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from("comunicadores").update({ ativo }).eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else {
      setComunicadores((prev) => prev.map((c) => c.id === id ? { ...c, ativo } : c));
      toast.success(ativo ? "Ativado" : "Desativado");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("comunicadores").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Removido"); fetchComunicadores(); }
  };

  const updateField = (id: string, field: keyof Comunicador, value: string) => {
    setComunicadores((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunicador Master</h1>
          <p className="text-muted-foreground">
            Conecte seu WhatsApp e configure webhooks para comunicação direta com tenants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchComunicadores} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={comunicadores.length >= MAX_COMUNICADORES}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>

      {/* QR Code Connection */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-5 w-5" />
            Conectar WhatsApp via Evolution API
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gere um QR Code para conectar uma instância WhatsApp. A API Key fica protegida no backend.
          </p>
        </CardHeader>
        <CardContent>
          {qrStep === "idle" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground/40" />
              </div>
              <Button onClick={handleGenerateQr} size="lg">
                <QrCode className="h-5 w-5 mr-2" /> Gerar QR Code
              </Button>
            </div>
          )}
          {qrStep === "generating" && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Criando instância e gerando QR Code...</p>
            </div>
          )}
          {qrStep === "showing" && (
            <div className="space-y-6">
              <div className="text-center">
                {qrBase64 ? (
                  <img
                    src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                    alt="QR Code WhatsApp"
                    className="mx-auto w-64 h-64 rounded-xl border"
                  />
                ) : (
                  <div className="mx-auto w-64 h-64 rounded-xl border flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">QR não disponível</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-3">
                  Abra o WhatsApp → Menu → Dispositivos conectados → Escaneie este QR Code
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Instância: <span className="font-mono">{instanceName}</span>
                </p>
              </div>
              <div className="border-t pt-4 max-w-sm mx-auto space-y-3">
                <p className="text-sm font-medium text-center">
                  Já escaneou? Preencha o webhook e confirme:
                </p>
                <div className="space-y-1">
                  <LabelUI>URL do Webhook (opcional agora, pode editar depois)</LabelUI>
                  <InputUI value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://n8n.seudominio.com/webhook/..." />
                </div>
                <Button className="w-full" onClick={handleConfirmConnection}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Confirmar Conexão e Registrar
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setQrStep("idle")}>Gerar Novo QR</Button>
              </div>
            </div>
          )}
          {qrStep === "confirming" && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Verificando conexão...</p>
            </div>
          )}
          {qrStep === "connected" && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-emerald-500" />
              <p className="text-sm font-medium text-foreground">Comunicador registrado com sucesso!</p>
              <Button variant="outline" onClick={() => setQrStep("idle")}>Conectar outro WhatsApp</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comunicadores list */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5" />
            Webhooks de Comunicação ({comunicadores.length}/{MAX_COMUNICADORES})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comunicadores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Webhook className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhum comunicador configurado</p>
              <p className="text-xs mt-1">Clique em "Adicionar" para criar um webhook</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comunicadores.map((c, idx) => {
                const isEditing = editingIds.has(c.id);
                return (
                  <div key={c.id} className={`border rounded-lg p-4 space-y-4 transition-colors ${isEditing ? "border-border bg-background" : "border-border bg-muted/40 opacity-80"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={c.ativo ? "default" : "outline"} className="text-xs">
                          {c.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
                        {!isEditing && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <Button size="icon" variant="outline" onClick={() => setEditingIds((prev) => new Set(prev).add(c.id))} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Switch checked={c.ativo} onCheckedChange={(v) => handleToggle(c.id, v)} disabled={!isEditing} />
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} disabled={!isEditing}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Nome</Label>
                        <Input placeholder="Ex: WhatsApp Principal" value={c.nome} onChange={(e) => updateField(c.id, "nome", e.target.value)} disabled={!isEditing} />
                      </div>
                      <div className="space-y-1">
                        <Label>Descrição</Label>
                        <Input placeholder="Descrição opcional" value={c.descricao || ""} onChange={(e) => updateField(c.id, "descricao", e.target.value)} disabled={!isEditing} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>URL do Webhook *</Label>
                      <Input placeholder="https://n8n.seudominio.com/webhook/..." value={c.webhook_url} onChange={(e) => updateField(c.id, "webhook_url", e.target.value)} disabled={!isEditing} />
                      <p className="text-xs text-muted-foreground">URL do webhook para envio de mensagens WhatsApp</p>
                    </div>
                    {isEditing && (
                      <div className="flex justify-end">
                        <Button size="sm" onClick={() => handleSave(c)}>
                          <Save className="h-4 w-4 mr-1" /> Salvar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
