import { useState, useEffect, useCallback } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus, Copy, Send, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import type { Tables } from "@/integrations/supabase/types";

type TrackingLink = Tables<"tracking_links">;
type ReservaRow = Tables<"reservas_transfer">;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  ativo: { label: "Ativo", variant: "default" },
  expirado: { label: "Expirado", variant: "outline" },
  concluido: { label: "Concluído", variant: "outline" },
};

const categoriaMap: Record<string, { label: string; color: string }> = {
  cliente: { label: "Cliente", color: "bg-green-600 text-white" },
  motorista: { label: "Motorista", color: "bg-blue-600 text-white" },
};

export default function TransferGeolocalizacao() {
  const tenantId = useTenantId();
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLink, setSelectedLink] = useState<TrackingLink | null>(null);
  const { toast } = useToast();

  // Form state
  const [formReservaId, setFormReservaId] = useState("");
  const [formCategoria, setFormCategoria] = useState("cliente");
  const [formNome, setFormNome] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formObs, setFormObs] = useState("");

  const fetchData = async () => {
    const [linksRes, reservasRes] = await Promise.all([
      supabase.from("tracking_links").select("*").order("created_at", { ascending: false }),
      supabase.from("reservas_transfer").select("*").order("created_at", { ascending: false }),
    ]);
    if (linksRes.data) setLinks(linksRes.data);
    if (reservasRes.data) setReservas(reservasRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("tracking-links-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tracking_links" }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getTrackingUrl = (token: string) => {
    return `${window.location.origin}/rastreamento/${token}`;
  };

  const handleCreate = async () => {
    if (!formReservaId) {
      toast({ title: "Selecione uma reserva", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("tracking_links").insert({
      reserva_id: formReservaId,
      categoria: formCategoria,
      cliente_nome: formNome || null,
      cliente_telefone: formTelefone || null,
      observacoes: formObs || null,
      tenant_id: tenantId,
    });

    if (error) {
      toast({ title: "Erro ao criar link", variant: "destructive" });
    } else {
      toast({ title: "Link de rastreamento criado" });
      setShowCreate(false);
      setFormReservaId("");
      setFormCategoria("cliente");
      setFormNome("");
      setFormTelefone("");
      setFormObs("");
      fetchData();
    }
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(getTrackingUrl(token));
    toast({ title: "Link copiado!" });
  };

  const handleSend = (link: TrackingLink) => {
    const url = getTrackingUrl(link.token);
    const msg = encodeURIComponent(`Olá${link.cliente_nome ? ` ${link.cliente_nome}` : ""}! Acesse o link abaixo para compartilhar sua localização durante a viagem:\n${url}`);
    const phone = (link.cliente_telefone || "").replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${msg}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tracking_links").delete().eq("id", id);
    toast({ title: "Link excluído" });
    if (selectedLink?.id === id) setSelectedLink(null);
    fetchData();
  };

  const getReservaLabel = (reservaId: string | null) => {
    if (!reservaId) return "—";
    const r = reservas.find((res) => res.id === reservaId);
    if (!r) return reservaId.substring(0, 8);
    return `${r.cliente_nome || "—"} • ${r.ida_data || r.por_hora_data || ""}`;
  };

  const isExpired = (link: TrackingLink) => {
    if (!link.expires_at) return false;
    return new Date(link.expires_at) < new Date();
  };

  const getStatus = (link: TrackingLink) => {
    if (isExpired(link) && link.status !== "concluido") return "expirado";
    return link.status;
  };

  const [mapImageUrls, setMapImageUrls] = useState<Record<string, string>>({});

  const fetchMapImage = useCallback(async (linkId: string, lat: number, lng: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("geocode", {
        body: { query: "static_map", type: "static_map", lat, lng, width: 600, height: 350 },
      });
      if (!error && data) {
        // The edge function returns the image as blob, we need to create an object URL
        // Actually since invoke returns JSON by default, let's handle the URL approach
      }
    } catch {
      // Fallback: no map
    }
  }, []);

  const buildMapEmbedUrl = (lat: number, lng: number) => {
    // Maps are now proxied via edge function - return null to show fallback
    // Static map images require a different approach with edge functions
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Geolocalização de Clientes</h1>
          <p className="text-muted-foreground">Gere links para rastrear a localização do cliente durante a viagem</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Link
        </Button>
      </div>

      {/* Selected link - map view */}
      {selectedLink && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {selectedLink.cliente_nome || "Cliente"} – Rastreamento ao Vivo
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLink(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Map */}
            {selectedLink.latitude && selectedLink.longitude ? (
              <div className="rounded-lg overflow-hidden border border-border mb-3">
                {buildMapEmbedUrl(selectedLink.latitude, selectedLink.longitude) ? (
                  <img
                    src={buildMapEmbedUrl(selectedLink.latitude, selectedLink.longitude)!}
                    alt="Localização"
                    className="w-full h-[350px] object-cover"
                  />
                ) : (
                  <div className="h-[350px] bg-muted flex items-center justify-center text-muted-foreground">
                    Configure um provedor de mapas em Configurações
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[250px] bg-muted/50 rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Aguardando cliente ativar localização...</p>
                </div>
              </div>
            )}

            <Badge className={statusMap[getStatus(selectedLink)]?.variant === "default" ? "" : ""} variant={statusMap[getStatus(selectedLink)]?.variant}>
              {statusMap[getStatus(selectedLink)]?.label || getStatus(selectedLink)}
            </Badge>

            {selectedLink.last_location_at && (
              <span className="text-xs text-muted-foreground ml-3">
                Última atualização: {new Date(selectedLink.last_location_at).toLocaleString("pt-BR")}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Links table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links de Rastreamento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : links.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum link criado ainda. Clique em "Novo Link" para começar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Reserva</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => {
                    const st = getStatus(link);
                    return (
                      <TableRow
                        key={link.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedLink(link)}
                      >
                        <TableCell className="font-medium">{link.cliente_nome || "—"}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${categoriaMap[link.categoria]?.color || "bg-muted"}`}>
                            {categoriaMap[link.categoria]?.label || link.categoria}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">{getReservaLabel(link.reserva_id)}</TableCell>
                        <TableCell>
                          <Badge variant={statusMap[st]?.variant || "outline"}>
                            {statusMap[st]?.label || st}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(link.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(link.token)} title="Copiar link">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleSend(link)} title="Enviar via WhatsApp">
                              <Send className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Excluir">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir link?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(link.id)}>Excluir</AlertDialogAction>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Link de Rastreamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reserva de Transfer *</Label>
              <Select value={formReservaId} onValueChange={setFormReservaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma reserva" />
                </SelectTrigger>
                <SelectContent>
                  {reservas.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.cliente_nome || "Sem nome"} • {r.ida_data || r.por_hora_data || "Sem data"} • {r.id.substring(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={formCategoria} onValueChange={setFormCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="motorista">Motorista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome (opcional)</Label>
              <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: João Silva" />
            </div>

            <div className="space-y-2">
              <Label>Telefone (opcional)</Label>
              <Input value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} placeholder="(__) _____-____" />
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea value={formObs} onChange={(e) => setFormObs(e.target.value)} placeholder="Digite observações sobre o rastreamento..." />
            </div>

            <Button onClick={handleCreate} className="w-full">Criar Link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
