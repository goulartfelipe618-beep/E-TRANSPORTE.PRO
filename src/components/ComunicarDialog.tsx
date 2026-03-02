import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MessageSquare, Loader2 } from "lucide-react";

interface Comunicador {
  id: string;
  nome: string;
  webhook_url: string;
  descricao: string | null;
  ativo: boolean;
}

interface ComunicarDialogProps {
  open: boolean;
  onClose: () => void;
  /** Data payload that will be sent to the webhook */
  payload: Record<string, unknown>;
  /** Label shown in the dialog header */
  titulo?: string;
}

export default function ComunicarDialog({ open, onClose, payload, titulo }: ComunicarDialogProps) {
  const [comunicadores, setComunicadores] = useState<Comunicador[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    setMensagem("");
    setLoading(true);
    supabase
      .from("comunicadores")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComunicadores(data || []);
        setLoading(false);
      });
  }, [open]);

  const handleSend = async () => {
    if (!selectedId) {
      toast.error("Selecione um comunicador");
      return;
    }
    const comunicador = comunicadores.find((c) => c.id === selectedId);
    if (!comunicador) return;

    setSending(true);
    try {
      const body = {
        ...payload,
        mensagem_adicional: mensagem || null,
        comunicador_nome: comunicador.nome,
      };

      const res = await fetch(comunicador.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Comunicação enviada com sucesso!");
      onClose();
    } catch (err: any) {
      toast.error(`Erro ao enviar: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comunicar
          </DialogTitle>
          <DialogDescription>
            {titulo || "Envie os dados para o comunicador selecionado"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comunicador selector */}
          <div className="space-y-2">
            <Label>Selecione o Comunicador</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : comunicadores.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum comunicador ativo. Configure em Sistema &gt; Comunicador.
              </p>
            ) : (
              <div className="space-y-2">
                {comunicadores.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left border rounded-lg p-3 transition-colors ${
                      selectedId === c.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">{c.nome}</span>
                      <Badge variant="default" className="text-xs">Ativo</Badge>
                    </div>
                    {c.descricao && (
                      <p className="text-xs text-muted-foreground mt-1">{c.descricao}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Additional message */}
          <div className="space-y-2">
            <Label>Mensagem Adicional (opcional)</Label>
            <Textarea
              placeholder="Digite uma mensagem que será enviada junto com os dados..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
            />
          </div>

          {/* Send button */}
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={sending || !selectedId}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Comunicação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
