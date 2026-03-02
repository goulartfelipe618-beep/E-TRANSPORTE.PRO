import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Save, Trash2, Plus, MessageSquare, Webhook, Pencil, Lock } from "lucide-react";

interface Comunicador {
  id: string;
  nome: string;
  webhook_url: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
}

const MAX_COMUNICADORES = 3;

export default function SistemaComunicador() {
  const [comunicadores, setComunicadores] = useState<Comunicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comunicadores")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setComunicadores(data);
    else toast.error("Erro ao carregar comunicadores");
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

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
    }).select().single();
    if (error) toast.error("Erro ao adicionar");
    else {
      toast.success("Comunicador adicionado");
      setEditingIds((prev) => new Set(prev).add(data.id));
      fetch();
    }
  };

  const handleSave = async (c: Comunicador) => {
    if (!c.webhook_url.trim()) {
      toast.error("Insira a URL do webhook");
      return;
    }
    const { error } = await supabase.from("comunicadores").update({
      nome: c.nome,
      webhook_url: c.webhook_url,
      descricao: c.descricao,
      ativo: c.ativo,
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
    else { toast.success("Removido"); fetch(); }
  };

  const updateField = (id: string, field: keyof Comunicador, value: string) => {
    setComunicadores((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunicador</h1>
          <p className="text-muted-foreground">
            Configure até {MAX_COMUNICADORES} webhooks para integração com WhatsApp (Evolution API / n8n)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={comunicadores.length >= MAX_COMUNICADORES}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5" />
            Webhooks de Comunicação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Insira a URL do webhook da sua API de WhatsApp (ex: Evolution API). O sistema enviará os dados para o n8n que processará e encaminhará ao Evolution para envio da mensagem.
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
                      <Input
                        placeholder="Ex: WhatsApp Principal"
                        value={c.nome}
                        onChange={(e) => updateField(c.id, "nome", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Descrição opcional"
                        value={c.descricao || ""}
                        onChange={(e) => updateField(c.id, "descricao", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>URL do Webhook *</Label>
                    <Input
                      placeholder="https://n8n.seudominio.com/webhook/..."
                      value={c.webhook_url}
                      onChange={(e) => updateField(c.id, "webhook_url", e.target.value)}
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole aqui a URL do webhook que conecta ao n8n/Evolution API para envio de mensagens WhatsApp
                    </p>
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
