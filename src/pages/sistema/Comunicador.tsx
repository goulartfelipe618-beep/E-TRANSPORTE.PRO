import { useState, useEffect, useCallback } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import {
  RefreshCw, Save, Trash2, Plus, MessageSquare, Webhook, Pencil, Lock,
  QrCode, Loader2, Clock, CheckCircle,
} from "lucide-react";

interface Comunicador {
  id: string;
  nome: string;
  webhook_url: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
}

interface SolicitacaoCom {
  id: string;
  status: string;
  instance_name: string | null;
  created_at: string;
}

const MAX_COMUNICADORES = 3;

export default function SistemaComunicador() {
  const tenantId = useTenantId();
  const { projectName } = useGlobalConfig();
  const [comunicadores, setComunicadores] = useState<Comunicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

  // QR Code flow
  const [qrStep, setQrStep] = useState<"idle" | "generating" | "showing" | "confirming" | "connected" | "pending" | "done">("idle");
  const [qrBase64, setQrBase64] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [telefoneWhats, setTelefoneWhats] = useState("");
  const [solicitacao, setSolicitacao] = useState<SolicitacaoCom | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  const fetchComunicadores = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comunicadores")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setComunicadores(data);
    setLoading(false);
  }, []);

  const fetchSolicitacao = useCallback(async () => {
    const { data } = await supabase
      .from("solicitacoes_comunicador")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setSolicitacao(data as any);
      if ((data as any).status === "pendente") {
        setQrStep("pending");
      } else if ((data as any).status === "concluido") {
        setQrStep("done");
      }
    }
  }, []);

  useEffect(() => {
    fetchComunicadores();
    fetchSolicitacao();
  }, [fetchComunicadores, fetchSolicitacao]);

  // Poll for status changes
  useEffect(() => {
    if (qrStep !== "pending") return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("solicitacoes_comunicador")
        .select("status")
        .eq("id", solicitacao?.id || "")
        .maybeSingle();
      if (data && (data as any).status === "concluido") {
        setQrStep("done");
        toast.success("Comunicador aprovado! Você pode configurar suas automações.");
        fetchComunicadores();
        clearInterval(interval);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [qrStep, solicitacao?.id]);

  const handleGenerateQr = async () => {
    setQrStep("generating");
    const name = `inst_${tenantId?.slice(0, 8) || "default"}_${Date.now()}`;
    setInstanceName(name);

    try {
      // Create instance via proxy
      const { data: createData, error: createErr } = await supabase.functions.invoke("evolution-proxy", {
        body: { action: "create_instance", instance_name: name },
      });
      if (createErr) throw createErr;

      // Get QR code
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

  const handleConfirmAndRequest = async () => {
    if (!telefoneWhats.trim()) {
      toast.error("Informe o número de WhatsApp");
      return;
    }
    setQrStep("confirming");
    try {
      // Check connection status
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
          descricao: `Instância: ${instanceName} | Tel: ${telefoneWhats}`,
          ativo: true,
          tenant_id: tenantId,
        });
        if (insertErr) throw insertErr;

        // Also send the solicitation for master tracking
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("solicitacoes_comunicador").insert({
            tenant_id: tenantId,
            user_id: user.id,
            nome_projeto: projectName,
            telefone_whatsapp: telefoneWhats.trim(),
            instance_name: instanceName,
            status: "concluido",
          } as any);
        }

        toast.success("WhatsApp conectado e comunicador registrado!");
        setQrStep("connected");
        setWebhookUrl("");
        setTelefoneWhats("");
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

  const handleRequestComunicador = async () => {
    if (!telefoneWhats.trim()) {
      toast.error("Informe o número de WhatsApp");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to DB
      const { data: inserted, error } = await supabase
        .from("solicitacoes_comunicador")
        .insert({
          tenant_id: tenantId,
          user_id: user.id,
          nome_projeto: projectName,
          telefone_whatsapp: telefoneWhats.trim(),
          instance_name: instanceName,
          status: "pendente",
        } as any)
        .select()
        .single();

      if (error) throw error;
      setSolicitacao(inserted as any);

      // Send webhook notification
      try {
        await fetch("https://evolution-api-n8n.zhsypi.easypanel.host/webhook-test/60feade2-bbf5-426f-bf78-c2d57730011d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome_projeto: projectName,
            telefone_whatsapp: telefoneWhats.trim(),
            instance_name: instanceName,
            tenant_id: tenantId,
          }),
        });
      } catch { /* webhook is non-blocking */ }

      setQrStep("pending");
      toast.success("Solicitação enviada! Aguarde a aprovação.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar solicitação");
    }
  };

  const handleAdd = async () => {
    if (comunicadores.length >= MAX_COMUNICADORES) {
      toast.error(`Máximo de ${MAX_COMUNICADORES} comunicadores permitidos`);
      return;
    }
    const { data, error } = await supabase.from("comunicadores").insert({
      nome: `Comunicador ${comunicadores.length + 1}`,
      webhook_url: "",
      descricao: "",
      ativo: false,
      tenant_id: tenantId,
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

  // Show completed state or existing comunicadores
  const showComunicadores = qrStep === "done" || qrStep === "connected" || comunicadores.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunicador</h1>
          <p className="text-muted-foreground">
            Conecte seu WhatsApp e configure webhooks para automações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchComunicadores(); fetchSolicitacao(); }} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          {showComunicadores && (
            <Button size="sm" onClick={handleAdd} disabled={comunicadores.length >= MAX_COMUNICADORES}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          )}
        </div>
      </div>

      {/* QR Code Connection Flow */}
      {!showComunicadores && qrStep !== "pending" && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5" />
              Conectar WhatsApp
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gere um QR Code para conectar seu WhatsApp e habilitar as automações do sistema.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrStep === "idle" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Clique abaixo para gerar o QR Code da Evolution API
                </p>
                <Button onClick={handleGenerateQr} size="lg">
                  <QrCode className="h-5 w-5 mr-2" /> Gerar QR Code
                </Button>
              </div>
            )}

            {qrStep === "generating" && (
              <div className="text-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
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
                </div>

                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-center">
                    Já escaneou? Preencha os dados e confirme a conexão:
                  </p>
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="space-y-1">
                      <Label>Número de WhatsApp *</Label>
                      <Input
                        value={telefoneWhats}
                        onChange={(e) => setTelefoneWhats(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>URL do Webhook (opcional, pode editar depois)</Label>
                      <Input
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://n8n.seudominio.com/webhook/..."
                      />
                    </div>
                    <Button className="w-full" onClick={handleConfirmAndRequest}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Confirmar Conexão e Registrar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {qrStep === "confirming" && (
              <div className="text-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Verificando conexão com Evolution API...</p>
              </div>
            )}

            {qrStep === "connected" && (
              <div className="text-center space-y-4 py-8">
                <CheckCircle className="h-16 w-16 mx-auto text-emerald-500" />
                <p className="text-sm font-medium text-foreground">Comunicador registrado com sucesso!</p>
                <p className="text-xs text-muted-foreground">Você pode configurar o webhook na lista abaixo.</p>
                <Button variant="outline" onClick={() => setQrStep("idle")}>Conectar outro WhatsApp</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending state */}
      {qrStep === "pending" && !showComunicadores && (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center space-y-4">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aguardando Aprovação</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Sua solicitação foi enviada. O administrador irá aprovar em até <strong>15 minutos</strong>.
              </p>
            </div>
            <Badge variant="outline">
              Status: Pendente
            </Badge>
            <p className="text-xs text-muted-foreground">
              Assim que o comunicador for aprovado, você poderá configurar todas as automações disponíveis no sistema.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Existing Comunicadores */}
      {showComunicadores && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5" />
              Webhooks de Comunicação
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure os webhooks para integração com WhatsApp.
            </p>
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
      )}
    </div>
  );
}
