import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Filter, Building2, Pencil, Trash2, Eye, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect (Frio)" },
  { value: "contato_inicial", label: "Contato Inicial" },
  { value: "negociacao", label: "Em Negociação" },
  { value: "ativo", label: "Ativo (Parceiro)" },
  { value: "inativo", label: "Inativo" },
];

const POTENCIAL_OPTIONS = [
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "ativo": return "default";
    case "negociacao": return "secondary";
    case "prospect": case "contato_inicial": return "outline";
    case "inativo": return "destructive";
    default: return "outline";
  }
};

interface NetworkCategory {
  id: string;
  nome: string;
  slug: string;
  tipos_estabelecimento: string[];
}

interface NetworkContact {
  id: string;
  nome_empresa: string;
  categoria: string;
  cnpj: string | null;
  tipo_estabelecimento: string | null;
  endereco: string | null;
  estado: string | null;
  cidade: string | null;
  website: string | null;
  contato_nome: string | null;
  contato_cargo: string | null;
  contato_telefone: string | null;
  contato_email: string | null;
  status_contato: string;
  potencial_negocio: string | null;
  responsavel: string | null;
  observacoes: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  nome_empresa: "",
  categoria: "",
  cnpj: "",
  tipo_estabelecimento: "",
  endereco: "",
  estado: "",
  cidade: "",
  website: "",
  contato_nome: "",
  contato_cargo: "",
  contato_telefone: "",
  contato_email: "",
  status_contato: "prospect",
  potencial_negocio: "medio",
  responsavel: "",
  observacoes: "",
};

export default function NetworkPage() {
  const tenantId = useTenantId();
  const [categories, setCategories] = useState<NetworkCategory[]>([]);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Filters
  const [filterCategoria, setFilterCategoria] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterCidade, setFilterCidade] = useState("");

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("network_categories")
      .select("id, nome, slug, tipos_estabelecimento")
      .eq("ativo", true)
      .order("nome");
    if (data) setCategories(data as any[]);
  };

  const fetchContacts = async () => {
    if (!tenantId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("network_contacts")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    setContacts((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchContacts(); }, [tenantId]);

  const selectedCategoryObj = categories.find(c => c.slug === form.categoria);
  const tiposForSelected = selectedCategoryObj?.tipos_estabelecimento ?? [];

  const filtered = contacts.filter((c) => {
    if (filterCategoria !== "all" && c.categoria !== filterCategoria) return false;
    if (filterStatus !== "all" && c.status_contato !== filterStatus) return false;
    if (filterEstado !== "all" && c.estado !== filterEstado) return false;
    if (filterCidade && !c.cidade?.toLowerCase().includes(filterCidade.toLowerCase())) return false;
    return true;
  });

  const openNew = () => {
    setForm({ ...EMPTY_FORM, categoria: categories[0]?.slug || "" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (c: NetworkContact) => {
    setForm({
      nome_empresa: c.nome_empresa,
      categoria: c.categoria,
      cnpj: c.cnpj || "",
      tipo_estabelecimento: c.tipo_estabelecimento || "",
      endereco: c.endereco || "",
      estado: c.estado || "",
      cidade: c.cidade || "",
      website: c.website || "",
      contato_nome: c.contato_nome || "",
      contato_cargo: c.contato_cargo || "",
      contato_telefone: c.contato_telefone || "",
      contato_email: c.contato_email || "",
      status_contato: c.status_contato,
      potencial_negocio: c.potencial_negocio || "medio",
      responsavel: c.responsavel || "",
      observacoes: c.observacoes || "",
    });
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome_empresa.trim()) { toast.error("Nome da empresa é obrigatório"); return; }
    if (!form.contato_email.trim()) { toast.error("E-mail corporativo é obrigatório"); return; }
    if (!form.categoria) { toast.error("Selecione uma categoria"); return; }

    const payload = {
      ...form,
      tenant_id: tenantId,
      cnpj: form.cnpj || null,
      tipo_estabelecimento: form.tipo_estabelecimento || null,
      endereco: form.endereco || null,
      estado: form.estado || null,
      cidade: form.cidade || null,
      website: form.website || null,
      contato_nome: form.contato_nome || null,
      contato_cargo: form.contato_cargo || null,
      contato_telefone: form.contato_telefone || null,
      potencial_negocio: form.potencial_negocio || null,
      responsavel: form.responsavel || null,
      observacoes: form.observacoes || null,
    };

    if (editingId) {
      const { error } = await supabase.from("network_contacts").update(payload as any).eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Contato atualizado!");
    } else {
      const { error } = await supabase.from("network_contacts").insert(payload as any);
      if (error) { toast.error("Erro ao cadastrar"); return; }
      toast.success("Contato cadastrado!");
    }
    setDialogOpen(false);
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este contato?")) return;
    await supabase.from("network_contacts").delete().eq("id", id);
    toast.success("Contato excluído");
    fetchContacts();
  };

  const statusLabel = (s: string) => STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
  const categoryLabel = (slug: string) => categories.find(c => c.slug === slug)?.nome ?? slug;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Network
          </h1>
          <p className="text-muted-foreground">Gerencie sua rede de parceiros e conexões corporativas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { fetchCategories(); fetchContacts(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openNew} className="gap-2" disabled={categories.length === 0}>
            <Plus className="h-4 w-4" /> Cadastrar Network
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado (UF)</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ESTADOS_BR.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cidade</Label>
              <Input placeholder="Filtrar por cidade..." value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Empresas Cadastradas
            <Badge variant="secondary" className="ml-2">{filtered.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum contato encontrado.</p>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Potencial</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.nome_empresa}</p>
                          {c.cnpj && <p className="text-xs text-muted-foreground">{c.cnpj}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{categoryLabel(c.categoria)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {c.contato_nome && <p className="text-sm">{c.contato_nome}</p>}
                          {c.contato_email && <p className="text-xs text-muted-foreground">{c.contato_email}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.cidade || c.estado ? `${c.cidade || ""}${c.cidade && c.estado ? " - " : ""}${c.estado || ""}` : "—"}
                      </TableCell>
                      <TableCell><Badge variant={statusColor(c.status_contato) as any}>{statusLabel(c.status_contato)}</Badge></TableCell>
                      <TableCell><span className="capitalize text-sm">{c.potencial_negocio || "—"}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedContact(c); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedContact?.nome_empresa}</DialogTitle></DialogHeader>
          {selectedContact && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Categoria</p><Badge variant="outline">{categoryLabel(selectedContact.categoria)}</Badge></div>
                <div><p className="text-muted-foreground">CNPJ</p><p>{selectedContact.cnpj || "—"}</p></div>
                <div><p className="text-muted-foreground">Tipo</p><p>{selectedContact.tipo_estabelecimento || "—"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Endereço</p><p>{selectedContact.endereco || "—"}</p></div>
                <div><p className="text-muted-foreground">Cidade</p><p>{selectedContact.cidade || "—"}</p></div>
                <div><p className="text-muted-foreground">Estado</p><p>{selectedContact.estado || "—"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Website</p><p>{selectedContact.website || "—"}</p></div>
              </div>
              <hr className="border-border" />
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Contato</p><p>{selectedContact.contato_nome || "—"}</p></div>
                <div><p className="text-muted-foreground">Cargo</p><p>{selectedContact.contato_cargo || "—"}</p></div>
                <div><p className="text-muted-foreground">Telefone</p><p>{selectedContact.contato_telefone || "—"}</p></div>
                <div><p className="text-muted-foreground">E-mail</p><p>{selectedContact.contato_email || "—"}</p></div>
              </div>
              <hr className="border-border" />
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-muted-foreground">Status</p><Badge variant={statusColor(selectedContact.status_contato) as any}>{statusLabel(selectedContact.status_contato)}</Badge></div>
                <div><p className="text-muted-foreground">Potencial</p><p className="capitalize">{selectedContact.potencial_negocio || "—"}</p></div>
                <div><p className="text-muted-foreground">Responsável</p><p>{selectedContact.responsavel || "—"}</p></div>
              </div>
              {selectedContact.observacoes && (
                <>
                  <hr className="border-border" />
                  <div><p className="text-muted-foreground">Observações</p><p className="whitespace-pre-wrap">{selectedContact.observacoes}</p></div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Contato Network" : "Novo Contato Network"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Company ID */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Building2 className="h-4 w-4" /> Identificação da Empresa</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nome da Empresa *</Label>
                    <Input value={form.nome_empresa} onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })} />
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v, tipo_estabelecimento: "" })}>
                      <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>CNPJ</Label>
                    <Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
                  </div>
                  <div>
                    <Label>Tipo de Empresa</Label>
                    {tiposForSelected.length > 0 ? (
                      <Select value={form.tipo_estabelecimento} onValueChange={(v) => setForm({ ...form, tipo_estabelecimento: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                        <SelectContent>
                          {tiposForSelected.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={form.tipo_estabelecimento} onChange={(e) => setForm({ ...form, tipo_estabelecimento: e.target.value })} placeholder="Tipo de empresa" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Endereço Completo</Label>
                  <AddressAutocomplete value={form.endereco} onChange={(v) => setForm({ ...form, endereco: v })} placeholder="Digite o endereço..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Estado (UF)</Label>
                    <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BR.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <Input placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">👤 Contato Principal</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nome do Contato</Label>
                    <Input value={form.contato_nome} onChange={(e) => setForm({ ...form, contato_nome: e.target.value })} />
                  </div>
                  <div>
                    <Label>Cargo/Função</Label>
                    <Input placeholder="Ex: Gerente de Compras" value={form.contato_cargo} onChange={(e) => setForm({ ...form, contato_cargo: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Telefone Direto</Label>
                    <Input value={form.contato_telefone} onChange={(e) => setForm({ ...form, contato_telefone: e.target.value })} />
                  </div>
                  <div>
                    <Label>E-mail Corporativo *</Label>
                    <Input type="email" value={form.contato_email} onChange={(e) => setForm({ ...form, contato_email: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">📊 Classificação e Segmentação</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Status do Contato</Label>
                    <Select value={form.status_contato} onValueChange={(v) => setForm({ ...form, status_contato: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Potencial de Negócio</Label>
                    <Select value={form.potencial_negocio} onValueChange={(v) => setForm({ ...form, potencial_negocio: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {POTENCIAL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Responsável</Label>
                    <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea placeholder="Registre interações, necessidades específicas, etc." value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar Alterações" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
