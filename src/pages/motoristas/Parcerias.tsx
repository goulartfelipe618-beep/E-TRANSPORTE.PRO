import { useState, useEffect } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Building2, FileText, Car, Users, Upload, X, Phone, Mail, Trash2, Save, MessageSquare, Eye, Edit, LayoutGrid, List } from "lucide-react";
import ComunicarDialog from "@/components/ComunicarDialog";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const COMBUSTIVEL_OPTIONS = ["Gasolina", "Etanol", "Flex", "Diesel", "GNV", "Elétrico", "Híbrido"];

interface ParceiroDB {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  inscricao_estadual: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  status: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  responsavel_email: string | null;
  logo_url: string | null;
  contrato_url: string | null;
  observacoes: string | null;
  created_at: string;
}

interface VeiculoForm {
  marca: string; modelo: string; ano: string; placa: string; cor: string;
  combustivel: string; renavam: string; status: string;
  crlv: File | null; seguro: File | null;
}

interface SubparceiroForm {
  nome: string; cpf_cnpj: string; telefone: string; email: string; funcao: string; observacoes: string;
  cnh: File | null; crlv: File | null;
}

interface SubparceiroDB {
  id: string; nome: string; cpf_cnpj: string | null; telefone: string | null;
  email: string | null; funcao: string | null; observacoes: string | null;
  cnh_url: string | null; crlv_url: string | null;
}

interface VeiculoDB {
  id: string; marca: string; modelo: string; ano: number | null; placa: string;
  cor: string | null; combustivel: string | null; renavam: string | null; status: string;
}

const emptyVeiculo = (): VeiculoForm => ({
  marca: "", modelo: "", ano: new Date().getFullYear().toString(), placa: "", cor: "",
  combustivel: "", renavam: "", status: "ativo", crlv: null, seguro: null,
});

const emptySubparceiro = (): SubparceiroForm => ({
  nome: "", cpf_cnpj: "", telefone: "", email: "", funcao: "", observacoes: "",
  cnh: null, crlv: null,
});

const emptyForm = {
  razao_social: "", nome_fantasia: "", cnpj: "", inscricao_estadual: "",
  email: "", telefone: "", whatsapp: "", status: "ativo",
  endereco: "", cidade: "", estado: "", cep: "",
  responsavel_nome: "", responsavel_telefone: "", responsavel_email: "",
  observacoes: "",
};

const statusColor: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  inativo: "bg-red-100 text-red-700",
};

export default function MotoristasParcerias() {
  const tenantId = useTenantId();
  const [parceiros, setParceiros] = useState<ParceiroDB[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("empresa");
  const [form, setForm] = useState({ ...emptyForm });
  const [files, setFiles] = useState<{ logo: File | null; contrato: File | null }>({ logo: null, contrato: null });
  const [veiculos, setVeiculos] = useState<VeiculoForm[]>([emptyVeiculo()]);
  const [subparceiros, setSubparceiros] = useState<SubparceiroForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [comunicando, setComunicando] = useState<ParceiroDB | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailParceiro, setDetailParceiro] = useState<ParceiroDB | null>(null);
  const [detailVeiculos, setDetailVeiculos] = useState<VeiculoDB[]>([]);
  const [detailSubparceiros, setDetailSubparceiros] = useState<SubparceiroDB[]>([]);

  const fetchParceiros = async () => {
    const { data } = await (supabase as any).from("parceiros").select("*").order("created_at", { ascending: false });
    if (data) setParceiros(data);
  };

  useEffect(() => { fetchParceiros(); }, []);

  const uploadFile = async (file: File, folder: string, parceiroId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${parceiroId}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("parceiro-documentos").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: signedData, error: signedError } = await supabase.storage.from("parceiro-documentos").createSignedUrl(path, 31536000);
    if (signedError) throw signedError;
    return signedData.signedUrl;
  };

  const populateFormFromParceiro = (p: ParceiroDB) => {
    setForm({
      razao_social: p.razao_social, nome_fantasia: p.nome_fantasia || "", cnpj: p.cnpj,
      inscricao_estadual: p.inscricao_estadual || "", email: p.email || "", telefone: p.telefone || "",
      whatsapp: p.whatsapp || "", status: p.status, endereco: p.endereco || "", cidade: p.cidade || "",
      estado: p.estado || "", cep: p.cep || "", responsavel_nome: p.responsavel_nome || "",
      responsavel_telefone: p.responsavel_telefone || "", responsavel_email: p.responsavel_email || "",
      observacoes: p.observacoes || "",
    });
  };

  const handleEdit = (p: ParceiroDB) => {
    setEditingId(p.id);
    populateFormFromParceiro(p);
    setActiveTab("empresa");
    setDialogOpen(true);
  };

  const handleViewDetails = async (p: ParceiroDB) => {
    setDetailParceiro(p);
    const [{ data: veiculos }, { data: subs }] = await Promise.all([
      (supabase as any).from("parceiro_veiculos").select("*").eq("parceiro_id", p.id),
      (supabase as any).from("subparceiros").select("*").eq("parceiro_id", p.id),
    ]);
    setDetailVeiculos(veiculos || []);
    setDetailSubparceiros(subs || []);
  };

  const handleSave = async () => {
    if (!form.razao_social || !form.cnpj) {
      toast.error("Preencha os campos obrigatórios: Razão Social e CNPJ.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        tenant_id: tenantId,
        razao_social: form.razao_social, nome_fantasia: form.nome_fantasia || null, cnpj: form.cnpj,
        inscricao_estadual: form.inscricao_estadual || null, email: form.email || null,
        telefone: form.telefone || null, whatsapp: form.whatsapp || null, status: form.status,
        endereco: form.endereco || null, cidade: form.cidade || null, estado: form.estado || null,
        cep: form.cep || null, responsavel_nome: form.responsavel_nome || null,
        responsavel_telefone: form.responsavel_telefone || null, responsavel_email: form.responsavel_email || null,
        observacoes: form.observacoes || null,
      };

      let pid: string;

      if (editingId) {
        const { error } = await (supabase as any).from("parceiros").update(payload).eq("id", editingId);
        if (error) throw error;
        pid = editingId;
      } else {
        const { data: parceiro, error } = await (supabase as any).from("parceiros").insert(payload).select().single();
        if (error) throw error;
        pid = parceiro.id;
      }

      // Upload docs in parallel
      const docUploads: Promise<[string, string]>[] = [];
      if (files.logo) docUploads.push(uploadFile(files.logo, "logo", pid).then(url => ["logo_url", url] as [string, string]));
      if (files.contrato) docUploads.push(uploadFile(files.contrato, "contrato", pid).then(url => ["contrato_url", url] as [string, string]));
      if (docUploads.length > 0) {
        const results = await Promise.all(docUploads);
        await (supabase as any).from("parceiros").update(Object.fromEntries(results)).eq("id", pid);
      }

      // Insert vehicles in parallel (always - new ones from the form)
      const vehicleInserts = veiculos.filter(v => v.marca && v.modelo && v.placa).map(async (v) => {
        const [crlvUrl, seguroUrl] = await Promise.all([
          v.crlv ? uploadFile(v.crlv, `veiculo-crlv-${v.placa}`, pid) : Promise.resolve(null),
          v.seguro ? uploadFile(v.seguro, `veiculo-seguro-${v.placa}`, pid) : Promise.resolve(null),
        ]);
        return (supabase as any).from("parceiro_veiculos").insert({
          parceiro_id: pid, marca: v.marca, modelo: v.modelo,
          ano: parseInt(v.ano) || null, placa: v.placa, cor: v.cor || null,
          combustivel: v.combustivel || null, renavam: v.renavam || null, status: v.status,
          tenant_id: tenantId, crlv_url: crlvUrl, seguro_url: seguroUrl,
        });
      });

      // Insert subparceiros in parallel (always - new ones from the form)
      const subInserts = subparceiros.filter(s => s.nome).map(async (s) => {
        const [cnhUrl, crlvUrl] = await Promise.all([
          s.cnh ? uploadFile(s.cnh, `sub-cnh-${s.nome}`, pid) : Promise.resolve(null),
          s.crlv ? uploadFile(s.crlv, `sub-crlv-${s.nome}`, pid) : Promise.resolve(null),
        ]);
        return (supabase as any).from("subparceiros").insert({
          parceiro_id: pid, nome: s.nome, cpf_cnpj: s.cpf_cnpj || null,
          telefone: s.telefone || null, email: s.email || null,
          funcao: s.funcao || null, observacoes: s.observacoes || null,
          tenant_id: tenantId, cnh_url: cnhUrl, crlv_url: crlvUrl,
        });
      });

      await Promise.all([...vehicleInserts, ...subInserts]);
      toast.success(editingId ? "Parceiro atualizado com sucesso!" : "Parceiro cadastrado com sucesso!");

      resetForm();
      setDialogOpen(false);
      fetchParceiros();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar parceiro.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setFiles({ logo: null, contrato: null });
    setVeiculos([emptyVeiculo()]);
    setSubparceiros([]);
    setActiveTab("empresa");
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;
    await (supabase as any).from("parceiros").delete().eq("id", id);
    toast.success("Parceiro excluído.");
    fetchParceiros();
  };

  const filtered = parceiros.filter(
    (p) =>
      p.razao_social.toLowerCase().includes(search.toLowerCase()) ||
      (p.nome_fantasia || "").toLowerCase().includes(search.toLowerCase()) ||
      p.cnpj.includes(search)
  );

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const GenericUpload = ({ label, file, onFile }: { label: string; file: File | null; onFile: (f: File | null) => void }) => (
    <div className="grid gap-2">
      <Label className="font-semibold">{label}</Label>
      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
            <Upload className="h-4 w-4" />
            {file ? file.name : "Selecionar arquivo (máx 5MB)"}
          </div>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && f.size > 5 * 1024 * 1024) { toast.error("Arquivo máx 5MB."); return; }
            onFile(f || null);
          }} />
        </label>
        {file && (
          <Button variant="ghost" size="icon" onClick={() => onFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    value ? (
      <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm col-span-2">{value}</span>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parcerias</h1>
          <p className="text-muted-foreground">Gestão de empresas parceiras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Parceiro</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Parceiro" : "Novo Parceiro"}</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="empresa" className="flex items-center gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" /> Empresa</TabsTrigger>
                <TabsTrigger value="documentos" className="flex items-center gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> Documentos</TabsTrigger>
                <TabsTrigger value="veiculos" className="flex items-center gap-1.5 text-xs"><Car className="h-3.5 w-3.5" /> Veículos</TabsTrigger>
                <TabsTrigger value="subparceiros" className="flex items-center gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Subparceiros</TabsTrigger>
              </TabsList>

              {/* EMPRESA */}
              <TabsContent value="empresa" className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold">Razão Social *</Label>
                    <Input value={form.razao_social} onChange={(e) => setField("razao_social", e.target.value)} placeholder="Razão social da empresa" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Nome Fantasia</Label>
                    <Input value={form.nome_fantasia} onChange={(e) => setField("nome_fantasia", e.target.value)} placeholder="Nome fantasia" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold">CNPJ *</Label>
                    <Input value={form.cnpj} onChange={(e) => setField("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Inscrição Estadual</Label>
                    <Input value={form.inscricao_estadual} onChange={(e) => setField("inscricao_estadual", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold">E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Telefone</Label>
                    <Input value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold">WhatsApp</Label>
                    <Input value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Status</Label>
                    <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Endereço</p>
                  <div className="grid gap-3">
                    <AddressAutocomplete value={form.endereco} onChange={(v) => setField("endereco", v)} placeholder="Rua, número, complemento, bairro" />
                    <div className="grid grid-cols-3 gap-3">
                      <Input value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} placeholder="Cidade" />
                      <Select value={form.estado} onValueChange={(v) => setField("estado", v)}>
                        <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>
                          {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input value={form.cep} onChange={(e) => setField("cep", e.target.value)} placeholder="00000-000" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Responsável</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Input value={form.responsavel_nome} onChange={(e) => setField("responsavel_nome", e.target.value)} placeholder="Nome" />
                    <Input value={form.responsavel_telefone} onChange={(e) => setField("responsavel_telefone", e.target.value)} placeholder="Telefone" />
                    <Input type="email" value={form.responsavel_email} onChange={(e) => setField("responsavel_email", e.target.value)} placeholder="E-mail" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="font-semibold">Observações</Label>
                  <Textarea className="mt-2" value={form.observacoes} onChange={(e) => setField("observacoes", e.target.value)} rows={3} />
                </div>
              </TabsContent>

              {/* DOCUMENTOS */}
              <TabsContent value="documentos" className="mt-4 space-y-4">
                <GenericUpload label="Logo da Empresa" file={files.logo} onFile={(f) => setFiles(prev => ({ ...prev, logo: f }))} />
                <GenericUpload label="Contrato" file={files.contrato} onFile={(f) => setFiles(prev => ({ ...prev, contrato: f }))} />
              </TabsContent>

              {/* VEÍCULOS */}
              <TabsContent value="veiculos" className="space-y-4 mt-4">
                {veiculos.map((v, idx) => (
                  <Card key={idx} className="border shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Veículo {veiculos.length > 1 ? `#${idx + 1}` : ""}</CardTitle>
                      {veiculos.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVeiculos(prev => prev.filter((_, i) => i !== idx))}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="grid gap-2"><Label>Marca *</Label><Input value={v.marca} onChange={(e) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, marca: e.target.value } : ve))} /></div>
                        <div className="grid gap-2"><Label>Modelo *</Label><Input value={v.modelo} onChange={(e) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, modelo: e.target.value } : ve))} /></div>
                        <div className="grid gap-2"><Label>Ano</Label><Input type="number" value={v.ano} onChange={(e) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, ano: e.target.value } : ve))} /></div>
                        <div className="grid gap-2"><Label>Placa *</Label><Input value={v.placa} onChange={(e) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, placa: e.target.value } : ve))} /></div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="grid gap-2"><Label>Cor</Label><Input value={v.cor} onChange={(e) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, cor: e.target.value } : ve))} /></div>
                        <div className="grid gap-2">
                          <Label>Combustível</Label>
                          <Select value={v.combustivel} onValueChange={(val) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, combustivel: val } : ve))}>
                            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>{COMBUSTIVEL_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2"><Label>Renavam</Label><Input value={v.renavam} onChange={(e) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, renavam: e.target.value } : ve))} /></div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select value={v.status} onValueChange={(val) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, status: val } : ve))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <GenericUpload label="CRLV" file={v.crlv} onFile={(f) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, crlv: f } : ve))} />
                        <GenericUpload label="Seguro" file={v.seguro} onFile={(f) => setVeiculos(prev => prev.map((ve, i) => i === idx ? { ...ve, seguro: f } : ve))} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setVeiculos(prev => [...prev, emptyVeiculo()])}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
                </Button>
              </TabsContent>

              {/* SUBPARCEIROS */}
              <TabsContent value="subparceiros" className="space-y-4 mt-4">
                {subparceiros.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum subparceiro adicionado.</p>
                )}
                {subparceiros.map((s, idx) => (
                  <Card key={idx} className="border shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Subparceiro #{idx + 1}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubparceiros(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-2"><Label>Nome *</Label><Input value={s.nome} onChange={(e) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, nome: e.target.value } : sp))} /></div>
                        <div className="grid gap-2"><Label>CPF/CNPJ</Label><Input value={s.cpf_cnpj} onChange={(e) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, cpf_cnpj: e.target.value } : sp))} /></div>
                        <div className="grid gap-2"><Label>Função</Label><Input value={s.funcao} onChange={(e) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, funcao: e.target.value } : sp))} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2"><Label>Telefone</Label><Input value={s.telefone} onChange={(e) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, telefone: e.target.value } : sp))} /></div>
                        <div className="grid gap-2"><Label>E-mail</Label><Input type="email" value={s.email} onChange={(e) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, email: e.target.value } : sp))} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <GenericUpload label="CNH (PDF)" file={s.cnh} onFile={(f) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, cnh: f } : sp))} />
                        <GenericUpload label="CRLV (PDF)" file={s.crlv} onFile={(f) => setSubparceiros(prev => prev.map((sp, i) => i === idx ? { ...sp, crlv: f } : sp))} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setSubparceiros(prev => [...prev, emptySubparceiro()])}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Subparceiro
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por razão social, fantasia ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button variant={viewMode === "card" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("card")} className="h-8">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="h-8">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CARD VIEW */}
      {viewMode === "card" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{p.nome_fantasia || p.razao_social}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{p.cnpj}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[p.status] || "bg-muted text-muted-foreground"}`}>
                  {p.status}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {p.telefone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {p.telefone}</div>}
                {p.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {p.email}</div>}
                {p.responsavel_nome && (
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Responsável: <span className="text-foreground font-medium">{p.responsavel_nome}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(p)} className="h-7 text-xs"><Eye className="h-3 w-3 mr-1" /> Detalhes</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="h-7 text-xs"><Edit className="h-3 w-3 mr-1" /> Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => setComunicando(p)} className="h-7 text-xs"><MessageSquare className="h-3 w-3 mr-1" /> Comunicar</Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-7 w-7 ml-auto"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">Nenhum parceiro cadastrado.</div>}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.logo_url ? <img src={p.logo_url} alt="" className="h-8 w-8 rounded-md object-cover" /> : <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center"><Building2 className="h-4 w-4 text-muted-foreground" /></div>}
                      <div>
                        <p className="font-medium text-sm">{p.nome_fantasia || p.razao_social}</p>
                        {p.email && <p className="text-xs text-muted-foreground">{p.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.cnpj}</TableCell>
                  <TableCell className="text-sm">{p.telefone || "—"}</TableCell>
                  <TableCell className="text-sm">{p.responsavel_nome || "—"}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[p.status] || "bg-muted text-muted-foreground"}`}>{p.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(p)} className="h-7 w-7" title="Detalhes"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-7 w-7" title="Editar"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setComunicando(p)} className="h-7 w-7" title="Comunicar"><MessageSquare className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-7 w-7" title="Excluir"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Nenhum parceiro cadastrado.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* DETAIL DIALOG */}
      <Dialog open={!!detailParceiro} onOpenChange={(open) => { if (!open) { setDetailParceiro(null); setDetailVeiculos([]); setDetailSubparceiros([]); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailParceiro && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {detailParceiro.logo_url ? <img src={detailParceiro.logo_url} alt="" className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>}
                  <div>
                    <span>{detailParceiro.nome_fantasia || detailParceiro.razao_social}</span>
                    <p className="text-xs font-normal text-muted-foreground mt-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[detailParceiro.status]}`}>{detailParceiro.status}</span>
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground">Dados da Empresa</p>
                <DetailRow label="Razão Social" value={detailParceiro.razao_social} />
                <DetailRow label="Nome Fantasia" value={detailParceiro.nome_fantasia} />
                <DetailRow label="CNPJ" value={detailParceiro.cnpj} />
                <DetailRow label="Inscrição Estadual" value={detailParceiro.inscricao_estadual} />
                <DetailRow label="E-mail" value={detailParceiro.email} />
                <DetailRow label="Telefone" value={detailParceiro.telefone} />
                <DetailRow label="WhatsApp" value={detailParceiro.whatsapp} />
                <DetailRow label="Endereço" value={detailParceiro.endereco} />
                <DetailRow label="Cidade" value={`${detailParceiro.cidade || ""}${detailParceiro.estado ? ` - ${detailParceiro.estado}` : ""}`} />

                {detailParceiro.responsavel_nome && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Responsável</p>
                    <DetailRow label="Nome" value={detailParceiro.responsavel_nome} />
                    <DetailRow label="Telefone" value={detailParceiro.responsavel_telefone} />
                    <DetailRow label="E-mail" value={detailParceiro.responsavel_email} />
                  </>
                )}

                {detailParceiro.observacoes && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Observações</p>
                    <p className="text-sm">{detailParceiro.observacoes}</p>
                  </>
                )}

                {detailVeiculos.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Veículos ({detailVeiculos.length})</p>
                    {detailVeiculos.map(v => (
                      <Card key={v.id} className="p-3">
                        <p className="font-medium text-sm">{v.marca} {v.modelo} {v.ano ? `(${v.ano})` : ""}</p>
                        <p className="text-xs text-muted-foreground">Placa: {v.placa} · {v.combustivel || "—"} · {v.cor || "—"}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize mt-1 inline-block ${statusColor[v.status]}`}>{v.status}</span>
                      </Card>
                    ))}
                  </>
                )}

                {detailSubparceiros.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Subparceiros ({detailSubparceiros.length})</p>
                    {detailSubparceiros.map(s => (
                      <Card key={s.id} className="p-3">
                        <p className="font-medium text-sm">{s.nome}</p>
                        <p className="text-xs text-muted-foreground">{s.funcao || "—"} · {s.cpf_cnpj || "—"}</p>
                        {s.telefone && <p className="text-xs text-muted-foreground">{s.telefone}</p>}
                        {(s.cnh_url || s.crlv_url) && (
                          <div className="flex gap-2 mt-1">
                            {s.cnh_url && <a href={s.cnh_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">CNH</a>}
                            {s.crlv_url && <a href={s.crlv_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">CRLV</a>}
                          </div>
                        )}
                      </Card>
                    ))}
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { handleEdit(detailParceiro); setDetailParceiro(null); }}>
                    <Edit className="h-4 w-4 mr-2" /> Editar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ComunicarDialog
        open={!!comunicando}
        onClose={() => setComunicando(null)}
        titulo={comunicando ? `Comunicar com ${comunicando.nome_fantasia || comunicando.razao_social}` : undefined}
        payload={comunicando ? {
          tipo: "parceiro", id: comunicando.id, razao_social: comunicando.razao_social,
          nome_fantasia: comunicando.nome_fantasia, cnpj: comunicando.cnpj, telefone: comunicando.telefone,
          whatsapp: comunicando.whatsapp, email: comunicando.email, responsavel_nome: comunicando.responsavel_nome,
          responsavel_telefone: comunicando.responsavel_telefone, status: comunicando.status,
        } : {}}
      />
    </div>
  );
}
