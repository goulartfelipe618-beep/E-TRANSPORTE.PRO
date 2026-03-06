import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, RefreshCw, Loader2, Globe, ExternalLink, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "aguardando", label: "Aguardando", color: "bg-yellow-500" },
  { value: "em_producao", label: "Em Produção", color: "bg-blue-500" },
  { value: "aprovado", label: "Aprovado", color: "bg-green-500" },
  { value: "publicado", label: "Publicado", color: "bg-emerald-600" },
  { value: "rejeitado", label: "Rejeitado", color: "bg-destructive" },
];

const TIPOS_SERVICO = [
  "Transfer Executivo", "Transporte para Grupos", "Excursões",
  "Transporte Corporativo", "Transporte para Aeroporto", "Venda de Produtos Online",
];

const FUNCIONALIDADES = [
  "Botão WhatsApp", "Formulário de orçamento", "Integração com Google Maps",
  "Integração com Google Business Profile", "Área para grupos/excursões",
  "Área de produtos online", "Blog", "Área administrativa futura",
];

export default function MasterWebsites() {
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [obsmaster, setObsmaster] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Editable briefing fields
  const [editForm, setEditForm] = useState<any>({});

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
    setEditMode(false);
    setEditForm({
      dominio: b.dominio || "",
      nome_empresa: b.nome_empresa || "",
      cidade_atuacao: b.cidade_atuacao || "",
      regiao_atendida: b.regiao_atendida || "",
      frota: b.frota || "",
      whatsapp: b.whatsapp || "",
      email_profissional: b.email_profissional || "",
      diferenciais: b.diferenciais || "",
      redes_sociais: b.redes_sociais || "",
      trabalha_24h: b.trabalha_24h || false,
      publico_alvo: b.publico_alvo || "",
      faixa_preco: b.faixa_preco || "",
      captacao_orcamento: b.captacao_orcamento || false,
      integracao_whatsapp: b.integracao_whatsapp || false,
      possui_logotipo: b.possui_logotipo || false,
      logo_url: b.logo_url || "",
      cores_preferidas: b.cores_preferidas || "",
      estilo_desejado: b.estilo_desejado || "",
      tipos_servico: b.tipos_servico || [],
      funcionalidades: b.funcionalidades || [],
      provedor_atual: b.provedor_atual || "",
      acesso_dns: b.acesso_dns || false,
    });
    setDialogOpen(true);
  };

  const toggleArrayItem = (key: string, item: string) => {
    setEditForm((p: any) => {
      const arr: string[] = p[key] || [];
      return { ...p, [key]: arr.includes(item) ? arr.filter((i: string) => i !== item) : [...arr, item] };
    });
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
    // If editing briefing fields
    if (editMode) {
      Object.assign(updates, {
        dominio: editForm.dominio || null,
        nome_empresa: editForm.nome_empresa || null,
        cidade_atuacao: editForm.cidade_atuacao || null,
        regiao_atendida: editForm.regiao_atendida || null,
        frota: editForm.frota || null,
        whatsapp: editForm.whatsapp || null,
        email_profissional: editForm.email_profissional || null,
        diferenciais: editForm.diferenciais || null,
        redes_sociais: editForm.redes_sociais || null,
        trabalha_24h: editForm.trabalha_24h,
        publico_alvo: editForm.publico_alvo || null,
        faixa_preco: editForm.faixa_preco || null,
        captacao_orcamento: editForm.captacao_orcamento,
        integracao_whatsapp: editForm.integracao_whatsapp,
        possui_logotipo: editForm.possui_logotipo,
        logo_url: editForm.logo_url || null,
        cores_preferidas: editForm.cores_preferidas || null,
        estilo_desejado: editForm.estilo_desejado || null,
        tipos_servico: editForm.tipos_servico,
        funcionalidades: editForm.funcionalidades,
        provedor_atual: editForm.provedor_atual || null,
        acesso_dns: editForm.acesso_dns,
      });
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
        <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">Nenhuma solicitação encontrada.</CardContent></Card>
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
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Briefing — {selected?.nome_empresa || "Website"}
              {!editMode && (
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setEditMode(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar Briefing
                </Button>
              )}
            </DialogTitle>
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

              {editMode ? (
                /* ─── Editable Fields ─── */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Domínio</Label><Input value={editForm.dominio} onChange={(e) => setEditForm((p: any) => ({ ...p, dominio: e.target.value }))} /></div>
                    <div><Label>Provedor</Label><Input value={editForm.provedor_atual} onChange={(e) => setEditForm((p: any) => ({ ...p, provedor_atual: e.target.value }))} /></div>
                    <div><Label>Empresa</Label><Input value={editForm.nome_empresa} onChange={(e) => setEditForm((p: any) => ({ ...p, nome_empresa: e.target.value }))} /></div>
                    <div><Label>Cidade</Label><Input value={editForm.cidade_atuacao} onChange={(e) => setEditForm((p: any) => ({ ...p, cidade_atuacao: e.target.value }))} /></div>
                    <div><Label>Região</Label><Input value={editForm.regiao_atendida} onChange={(e) => setEditForm((p: any) => ({ ...p, regiao_atendida: e.target.value }))} /></div>
                    <div><Label>Frota</Label><Input value={editForm.frota} onChange={(e) => setEditForm((p: any) => ({ ...p, frota: e.target.value }))} /></div>
                    <div><Label>WhatsApp</Label><Input value={editForm.whatsapp} onChange={(e) => setEditForm((p: any) => ({ ...p, whatsapp: e.target.value }))} /></div>
                    <div><Label>E-mail</Label><Input value={editForm.email_profissional} onChange={(e) => setEditForm((p: any) => ({ ...p, email_profissional: e.target.value }))} /></div>
                    <div><Label>Redes Sociais</Label><Input value={editForm.redes_sociais} onChange={(e) => setEditForm((p: any) => ({ ...p, redes_sociais: e.target.value }))} /></div>
                    <div><Label>Público-alvo</Label><Input value={editForm.publico_alvo} onChange={(e) => setEditForm((p: any) => ({ ...p, publico_alvo: e.target.value }))} /></div>
                    <div><Label>Cores</Label><Input value={editForm.cores_preferidas} onChange={(e) => setEditForm((p: any) => ({ ...p, cores_preferidas: e.target.value }))} /></div>
                    <div><Label>Logo URL</Label><Input value={editForm.logo_url} onChange={(e) => setEditForm((p: any) => ({ ...p, logo_url: e.target.value }))} /></div>
                  </div>
                  <div><Label>Diferenciais</Label><Textarea value={editForm.diferenciais} onChange={(e) => setEditForm((p: any) => ({ ...p, diferenciais: e.target.value }))} /></div>
                  <div>
                    <Label>Faixa de preço</Label>
                    <Select value={editForm.faixa_preco} onValueChange={(v) => setEditForm((p: any) => ({ ...p, faixa_preco: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economico">Econômico</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estilo</Label>
                    <Select value={editForm.estilo_desejado} onValueChange={(v) => setEditForm((p: any) => ({ ...p, estilo_desejado: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moderno">Moderno</SelectItem>
                        <SelectItem value="luxo">Luxo</SelectItem>
                        <SelectItem value="minimalista">Minimalista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={editForm.acesso_dns} onCheckedChange={(v) => setEditForm((p: any) => ({ ...p, acesso_dns: !!v }))} /> Acesso DNS</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={editForm.trabalha_24h} onCheckedChange={(v) => setEditForm((p: any) => ({ ...p, trabalha_24h: !!v }))} /> 24h</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={editForm.captacao_orcamento} onCheckedChange={(v) => setEditForm((p: any) => ({ ...p, captacao_orcamento: !!v }))} /> Captação orçamento</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={editForm.integracao_whatsapp} onCheckedChange={(v) => setEditForm((p: any) => ({ ...p, integracao_whatsapp: !!v }))} /> Integração WhatsApp</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={editForm.possui_logotipo} onCheckedChange={(v) => setEditForm((p: any) => ({ ...p, possui_logotipo: !!v }))} /> Possui logotipo</label>
                  </div>

                  <div>
                    <Label className="mb-1 block">Serviços</Label>
                    <div className="flex flex-wrap gap-2">
                      {TIPOS_SERVICO.map((s) => (
                        <label key={s} className="flex items-center gap-1 text-sm">
                          <Checkbox checked={editForm.tipos_servico?.includes(s)} onCheckedChange={() => toggleArrayItem("tipos_servico", s)} /> {s}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1 block">Funcionalidades</Label>
                    <div className="flex flex-wrap gap-2">
                      {FUNCIONALIDADES.map((f) => (
                        <label key={f} className="flex items-center gap-1 text-sm">
                          <Checkbox checked={editForm.funcionalidades?.includes(f)} onCheckedChange={() => toggleArrayItem("funcionalidades", f)} /> {f}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>Cancelar Edição</Button>
                </div>
              ) : (
                /* ─── Read-only view ─── */
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><strong>Domínio:</strong> {selected.dominio || "—"}</div>
                    <div><strong>Provedor:</strong> {selected.provedor_atual || "—"}</div>
                    <div><strong>Acesso DNS:</strong> {selected.acesso_dns ? "Sim" : "Não"}</div>
                  </div>

                  <div className="text-sm">
                    <strong>Serviços:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selected.tipos_servico?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                  </div>

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

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><strong>Público-alvo:</strong> {selected.publico_alvo || "—"}</div>
                    <div><strong>Faixa preço:</strong> {selected.faixa_preco || "—"}</div>
                    <div><strong>Captação orçamento:</strong> {selected.captacao_orcamento ? "Sim" : "Não"}</div>
                    <div><strong>Integração WhatsApp:</strong> {selected.integracao_whatsapp ? "Sim" : "Não"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><strong>Logotipo:</strong> {selected.possui_logotipo ? "Sim" : "Não"}</div>
                    <div><strong>Cores:</strong> {selected.cores_preferidas || "—"}</div>
                    <div><strong>Estilo:</strong> {selected.estilo_desejado || "—"}</div>
                    {selected.logo_url && <div><strong>Logo:</strong> <a href={selected.logo_url} target="_blank" className="text-primary underline">Ver</a></div>}
                  </div>

                  <div className="text-sm">
                    <strong>Funcionalidades:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selected.funcionalidades?.map((f: string) => <Badge key={f} variant="outline">{f}</Badge>)}
                    </div>
                  </div>
                </>
              )}

              {/* Master Controls (always visible) */}
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
                  <Textarea placeholder="Ex: Domínio disponível, site em produção..." value={obsmaster} onChange={(e) => setObsmaster(e.target.value)} />
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
