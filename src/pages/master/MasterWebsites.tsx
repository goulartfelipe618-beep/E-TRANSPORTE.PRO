import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, RefreshCw, Loader2, Globe, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "aguardando", label: "Aguardando", color: "bg-yellow-500" },
  { value: "em_producao", label: "Em Produção", color: "bg-blue-500" },
  { value: "aprovado", label: "Aprovado", color: "bg-green-500" },
  { value: "publicado", label: "Publicado", color: "bg-emerald-600" },
  { value: "rejeitado", label: "Rejeitado", color: "bg-destructive" },
];

export default function MasterWebsites() {
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [obsmaster, setObsmaster] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchBriefings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("website_briefings")
      .select("*, tenants(nome)")
      .order("created_at", { ascending: false });
    setBriefings((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBriefings(); }, []);

  const openDetail = (b: any) => {
    setSelected(b);
    setNewStatus(b.status);
    setSiteUrl(b.site_url || "");
    setObsmaster(b.observacoes_master || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const updates: any = {
      status: newStatus,
      site_url: siteUrl || null,
      observacoes_master: obsmaster || null,
    };
    if (newStatus === "publicado" && !selected.data_publicacao) {
      updates.data_publicacao = new Date().toISOString();
    }
    const { error } = await supabase.from("website_briefings").update(updates).eq("id", selected.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Atualizado com sucesso!" });
      setDialogOpen(false);
      fetchBriefings();
    }
    setSaving(false);
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return <Badge className={`${s?.color || "bg-muted"} text-white`}>{s?.label || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website — Solicitações</h1>
          <p className="text-muted-foreground">Gerencie briefings e publicações de sites.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBriefings}>
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : briefings.length === 0 ? (
        <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">Nenhuma solicitação de website encontrada.</CardContent></Card>
      ) : (
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {briefings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{(b as any).tenants?.nome || "—"}</TableCell>
                    <TableCell>{b.nome_empresa || "—"}</TableCell>
                    <TableCell>{b.dominio || "—"}</TableCell>
                    <TableCell>{(b as any).modelo_nome || "—"}</TableCell>
                    <TableCell>{new Date(b.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openDetail(b)}>
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Briefing — {selected?.nome_empresa || "Website"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Template info */}
              {(selected as any).modelo_nome && (
                <div className="p-3 bg-primary/5 rounded-lg text-sm space-y-1">
                  <strong>Modelo Selecionado:</strong> {(selected as any).modelo_nome}
                  {(selected as any).modelo_preview_url && (
                    <div>
                      <Button size="sm" variant="link" className="p-0 h-auto" onClick={() => window.open((selected as any).modelo_preview_url, "_blank")}>
                        <ExternalLink className="h-3 w-3 mr-1" /> Ver preview do modelo
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Domain */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Domínio solicitado:</strong> {selected.dominio || "—"}</div>
                <div><strong>Provedor:</strong> {selected.provedor_atual || "—"}</div>
                <div><strong>Acesso DNS:</strong> {selected.acesso_dns ? "Sim" : "Não"}</div>
              </div>

              {/* Services */}
              <div className="text-sm">
                <strong>Serviços:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selected.tipos_servico?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>

              {selected.venda_produtos_online && (
                <div className="text-sm p-3 bg-muted/50 rounded-lg">
                  <strong>Produtos Online:</strong>
                  <p>Descrição: {selected.produtos_descricao || "—"}</p>
                  <p>Quantidade: {selected.produtos_quantidade || "—"}</p>
                  <p>Pagamento online: {selected.pagamento_online ? "Sim" : "Não"}</p>
                </div>
              )}

              {/* Company */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Empresa:</strong> {selected.nome_empresa || "—"}</div>
                <div><strong>Cidade:</strong> {selected.cidade_atuacao || "—"}</div>
                <div><strong>Região:</strong> {selected.regiao_atendida || "—"}</div>
                <div><strong>Frota:</strong> {selected.frota || "—"}</div>
                <div><strong>WhatsApp:</strong> {selected.whatsapp || "—"}</div>
                <div><strong>E-mail:</strong> {selected.email_profissional || "—"}</div>
                <div><strong>24h:</strong> {selected.trabalha_24h ? "Sim" : "Não"}</div>
                <div><strong>Redes:</strong> {selected.redes_sociais || "—"}</div>
                <div className="col-span-2"><strong>Diferenciais:</strong> {selected.diferenciais || "—"}</div>
              </div>

              {/* Positioning */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Público-alvo:</strong> {selected.publico_alvo || "—"}</div>
                <div><strong>Faixa preço:</strong> {selected.faixa_preco || "—"}</div>
                <div><strong>Captação orçamento:</strong> {selected.captacao_orcamento ? "Sim" : "Não"}</div>
                <div><strong>Integração WhatsApp:</strong> {selected.integracao_whatsapp ? "Sim" : "Não"}</div>
              </div>

              {/* Visual */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Logotipo:</strong> {selected.possui_logotipo ? "Sim" : "Não"}</div>
                <div><strong>Cores:</strong> {selected.cores_preferidas || "—"}</div>
                <div><strong>Estilo:</strong> {selected.estilo_desejado || "—"}</div>
                {selected.logo_url && <div><strong>Logo URL:</strong> <a href={selected.logo_url} target="_blank" className="text-primary underline">Ver</a></div>}
              </div>

              {/* Features */}
              <div className="text-sm">
                <strong>Funcionalidades:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selected.funcionalidades?.map((f: string) => <Badge key={f} variant="outline">{f}</Badge>)}
                </div>
              </div>

              {/* Master Controls */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-bold text-foreground">Controles do Master</h3>
                <div>
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>URL do Site (quando publicado)</Label>
                  <Input placeholder="https://seusite.com.br" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
                </div>
                <div>
                  <Label>Observações para o cliente</Label>
                  <Textarea placeholder="Ex: Domínio disponível, em produção..." value={obsmaster} onChange={(e) => setObsmaster(e.target.value)} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
