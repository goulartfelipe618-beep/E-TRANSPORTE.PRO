import { useState, useEffect } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, User, FileText, CreditCard, Car, Upload, X, Phone, Mail, Edit, Trash2, MessageSquare, Eye, LayoutGrid, List } from "lucide-react";
import ComunicarDialog from "@/components/ComunicarDialog";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const CNH_CATEGORIAS = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];
const COMBUSTIVEL_OPTIONS = ["Gasolina", "Etanol", "Flex", "Diesel", "GNV", "Elétrico", "Híbrido"];
const TIPO_CONTA_OPTIONS = ["Corrente", "Poupança"];

interface MotoristaDB {
  id: string;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  cnh_numero: string | null;
  cnh_categoria: string | null;
  cnh_validade: string | null;
  status: string;
  observacoes: string | null;
  foto_perfil_url: string | null;
  cnh_frente_url: string | null;
  cnh_verso_url: string | null;
  comprovante_residencia_url: string | null;
  tipo_pagamento: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  tipo_conta: string | null;
  chave_pix: string | null;
  nome_recebedor: string | null;
  cpf_cnpj_recebedor: string | null;
  possui_veiculo: boolean;
  created_at: string;
}

interface VeiculoDB {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string | null;
  placa: string;
  combustivel: string | null;
  renavam: string | null;
  chassi: string | null;
  status: string;
  observacoes: string | null;
}

const emptyForm = {
  nome_completo: "", cpf: "", rg: "", data_nascimento: "", telefone: "", email: "",
  endereco: "", cidade: "", estado: "", cep: "",
  cnh_numero: "", cnh_categoria: "", cnh_validade: "", status: "ativo", observacoes: "",
  tipo_pagamento: "", banco: "", agencia: "", conta: "", tipo_conta: "", chave_pix: "", nome_recebedor: "", cpf_cnpj_recebedor: "",
  possui_veiculo: false,
  v_marca: "", v_modelo: "", v_ano: "", v_cor: "", v_placa: "", v_combustivel: "",
  v_renavam: "", v_chassi: "", v_status: "ativo", v_observacoes: "",
};

const statusColor: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  inativo: "bg-red-100 text-red-700",
};

export default function MotoristasCadastros() {
  const tenantId = useTenantId();
  const [motoristas, setMotoristas] = useState<MotoristaDB[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pessoal");
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [comunicando, setComunicando] = useState<MotoristaDB | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [detailMotorista, setDetailMotorista] = useState<MotoristaDB | null>(null);
  const [detailVeiculos, setDetailVeiculos] = useState<VeiculoDB[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVeiculos, setEditingVeiculos] = useState<VeiculoDB[]>([]);
  const [files, setFiles] = useState<Record<string, File | null>>({
    foto_perfil: null, cnh_frente: null, cnh_verso: null, comprovante_residencia: null,
    crlv: null, seguro: null, fotos_veiculo: null,
  });

  const fetchMotoristas = async () => {
    const { data } = await (supabase as any).from("motoristas").select("*").order("created_at", { ascending: false });
    if (data) setMotoristas(data);
  };

  useEffect(() => { fetchMotoristas(); }, []);

  const uploadFile = async (file: File, folder: string, motoristaId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${motoristaId}/${folder}.${ext}`;
    const { error } = await supabase.storage.from("motorista-documentos").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("motorista-documentos").getPublicUrl(path);
    return data.publicUrl;
  };

  const populateFormFromMotorista = (m: MotoristaDB) => {
    setForm({
      nome_completo: m.nome_completo, cpf: m.cpf, rg: m.rg || "", data_nascimento: m.data_nascimento || "",
      telefone: m.telefone, email: m.email || "", endereco: m.endereco || "", cidade: m.cidade || "",
      estado: m.estado || "", cep: m.cep || "", cnh_numero: m.cnh_numero || "", cnh_categoria: m.cnh_categoria || "",
      cnh_validade: m.cnh_validade || "", status: m.status, observacoes: m.observacoes || "",
      tipo_pagamento: m.tipo_pagamento || "", banco: m.banco || "", agencia: m.agencia || "",
      conta: m.conta || "", tipo_conta: m.tipo_conta || "", chave_pix: m.chave_pix || "",
      nome_recebedor: m.nome_recebedor || "", cpf_cnpj_recebedor: m.cpf_cnpj_recebedor || "",
      possui_veiculo: m.possui_veiculo,
      v_marca: "", v_modelo: "", v_ano: "", v_cor: "", v_placa: "", v_combustivel: "",
      v_renavam: "", v_chassi: "", v_status: "ativo", v_observacoes: "",
    });
  };

  const handleEdit = async (m: MotoristaDB) => {
    setEditingId(m.id);
    populateFormFromMotorista(m);
    // Load existing vehicles for editing
    const { data: veiculos } = await (supabase as any).from("motorista_veiculos").select("*").eq("motorista_id", m.id);
    const vList = veiculos || [];
    setEditingVeiculos(vList);
    if (vList.length > 0) {
      const v = vList[0];
      setForm(prev => ({
        ...prev,
        possui_veiculo: true,
        v_marca: v.marca || "", v_modelo: v.modelo || "", v_ano: String(v.ano || ""),
        v_cor: v.cor || "", v_placa: v.placa || "", v_combustivel: v.combustivel || "",
        v_renavam: v.renavam || "", v_chassi: v.chassi || "",
        v_status: v.status || "ativo", v_observacoes: v.observacoes || "",
      }));
    }
    setActiveTab("pessoal");
    setDialogOpen(true);
  };

  const handleViewDetails = async (m: MotoristaDB) => {
    setDetailMotorista(m);
    const { data } = await (supabase as any).from("motorista_veiculos").select("*").eq("motorista_id", m.id);
    setDetailVeiculos(data || []);
  };

  const handleSave = async () => {
    if (!form.nome_completo || !form.cpf || !form.telefone) {
      toast.error("Preencha os campos obrigatórios: Nome, CPF e Telefone.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        tenant_id: tenantId,
        nome_completo: form.nome_completo, cpf: form.cpf, rg: form.rg || null,
        data_nascimento: form.data_nascimento || null, telefone: form.telefone, email: form.email || null,
        endereco: form.endereco || null, cidade: form.cidade || null, estado: form.estado || null,
        cep: form.cep || null, cnh_numero: form.cnh_numero || null, cnh_categoria: form.cnh_categoria || null,
        cnh_validade: form.cnh_validade || null, status: form.status, observacoes: form.observacoes || null,
        tipo_pagamento: form.tipo_pagamento || null, banco: form.banco || null, agencia: form.agencia || null,
        conta: form.conta || null, tipo_conta: form.tipo_conta || null, chave_pix: form.chave_pix || null,
        nome_recebedor: form.nome_recebedor || null, cpf_cnpj_recebedor: form.cpf_cnpj_recebedor || null,
        possui_veiculo: form.possui_veiculo,
      };

      let mid: string;

      if (editingId) {
        const { error } = await (supabase as any).from("motoristas").update(payload).eq("id", editingId);
        if (error) throw error;
        mid = editingId;
        toast.success("Motorista atualizado com sucesso!");
      } else {
        const { data: motorista, error } = await (supabase as any).from("motoristas").insert(payload).select().single();
        if (error) throw error;
        mid = motorista.id;

        // Insert vehicle if applicable (only on create)
        if (form.possui_veiculo && form.v_marca && form.v_modelo && form.v_placa && form.v_ano) {
          const [crlvUrl, seguroUrl] = await Promise.all([
            files.crlv ? uploadFile(files.crlv, "crlv", mid) : Promise.resolve(null),
            files.seguro ? uploadFile(files.seguro, "seguro", mid) : Promise.resolve(null),
          ]);
          await (supabase as any).from("motorista_veiculos").insert({
            motorista_id: mid, marca: form.v_marca, modelo: form.v_modelo,
            ano: parseInt(form.v_ano), cor: form.v_cor || null, placa: form.v_placa,
            combustivel: form.v_combustivel || null, renavam: form.v_renavam || null,
            chassi: form.v_chassi || null, status: form.v_status, observacoes: form.v_observacoes || null,
            tenant_id: tenantId, crlv_url: crlvUrl, seguro_url: seguroUrl,
          });
        }
        toast.success("Motorista cadastrado com sucesso!");
      }

      // Upload documents in parallel
      const docUploads: Promise<[string, string]>[] = [];
      if (files.foto_perfil) docUploads.push(uploadFile(files.foto_perfil, "foto-perfil", mid).then(url => ["foto_perfil_url", url] as [string, string]));
      if (files.cnh_frente) docUploads.push(uploadFile(files.cnh_frente, "cnh-frente", mid).then(url => ["cnh_frente_url", url] as [string, string]));
      if (files.cnh_verso) docUploads.push(uploadFile(files.cnh_verso, "cnh-verso", mid).then(url => ["cnh_verso_url", url] as [string, string]));
      if (files.comprovante_residencia) docUploads.push(uploadFile(files.comprovante_residencia, "comprovante", mid).then(url => ["comprovante_residencia_url", url] as [string, string]));

      if (docUploads.length > 0) {
        const results = await Promise.all(docUploads);
        const docUpdates = Object.fromEntries(results);
        await (supabase as any).from("motoristas").update(docUpdates).eq("id", mid);
      }

      setForm({ ...emptyForm });
      setFiles({ foto_perfil: null, cnh_frente: null, cnh_verso: null, comprovante_residencia: null, crlv: null, seguro: null, fotos_veiculo: null });
      setActiveTab("pessoal");
      setEditingId(null);
      setDialogOpen(false);
      fetchMotoristas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar motorista.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este motorista?")) return;
    await (supabase as any).from("motoristas").delete().eq("id", id);
    toast.success("Motorista excluído.");
    fetchMotoristas();
  };

  const filtered = motoristas.filter(
    (m) =>
      m.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      m.cpf.includes(search)
  );

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const FileUploadField = ({ label, fileKey }: { label: string; fileKey: string }) => (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
            <Upload className="h-4 w-4" />
            {(files as any)[fileKey] ? (files as any)[fileKey].name : "Selecionar arquivo (máx 5MB)"}
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 5 * 1024 * 1024) {
                toast.error("Arquivo deve ter no máximo 5MB.");
                return;
              }
              setFiles((prev) => ({ ...prev, [fileKey]: file || null }));
            }}
          />
        </label>
        {(files as any)[fileKey] && (
          <Button variant="ghost" size="icon" onClick={() => setFiles((prev) => ({ ...prev, [fileKey]: null }))}>
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
          <h1 className="text-2xl font-bold text-foreground">Cadastros de Motoristas</h1>
          <p className="text-muted-foreground">Gerenciamento completo de motoristas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setActiveTab("pessoal"); setForm({ ...emptyForm }); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Motorista</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Motorista" : "Cadastrar Motorista"}</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pessoal" className="flex items-center gap-1 text-xs"><User className="h-3.5 w-3.5" /> Pessoal</TabsTrigger>
                <TabsTrigger value="documentos" className="flex items-center gap-1 text-xs"><FileText className="h-3.5 w-3.5" /> Documentos</TabsTrigger>
                <TabsTrigger value="pagamento" className="flex items-center gap-1 text-xs"><CreditCard className="h-3.5 w-3.5" /> Pagamento</TabsTrigger>
                <TabsTrigger value="veiculo" className="flex items-center gap-1 text-xs"><Car className="h-3.5 w-3.5" /> Veículo</TabsTrigger>
              </TabsList>

              {/* PESSOAL */}
              <TabsContent value="pessoal" className="space-y-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground">Dados Básicos</p>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Nome Completo *</Label>
                    <Input value={form.nome_completo} onChange={(e) => setField("nome_completo", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>CPF *</Label>
                      <Input value={form.cpf} onChange={(e) => setField("cpf", e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <div className="grid gap-2">
                      <Label>RG</Label>
                      <Input value={form.rg} onChange={(e) => setField("rg", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Data de Nascimento</Label>
                      <Input type="date" value={form.data_nascimento} onChange={(e) => setField("data_nascimento", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Telefone *</Label>
                      <Input value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} placeholder="(11) 99999-0000" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                  </div>
                </div>

                <p className="text-sm font-semibold text-muted-foreground pt-2">Endereço</p>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Endereço Completo</Label>
                    <AddressAutocomplete value={form.endereco} onChange={(v) => setField("endereco", v)} placeholder="Rua, número, complemento, bairro" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label>Cidade</Label>
                      <Input value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Estado (UF)</Label>
                      <Select value={form.estado} onValueChange={(v) => setField("estado", v)}>
                        <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>
                          {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>CEP</Label>
                      <Input value={form.cep} onChange={(e) => setField("cep", e.target.value)} placeholder="00000-000" />
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-muted-foreground pt-2">CNH</p>
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label>Número da CNH</Label>
                      <Input value={form.cnh_numero} onChange={(e) => setField("cnh_numero", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Select value={form.cnh_categoria} onValueChange={(v) => setField("cnh_categoria", v)}>
                        <SelectTrigger><SelectValue placeholder="Cat." /></SelectTrigger>
                        <SelectContent>
                          {CNH_CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Validade</Label>
                      <Input type="date" value={form.cnh_validade} onChange={(e) => setField("cnh_validade", e.target.value)} />
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-muted-foreground pt-2">Status</p>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                <p className="text-sm font-semibold text-muted-foreground pt-2">Observações</p>
                <Textarea value={form.observacoes} onChange={(e) => setField("observacoes", e.target.value)} placeholder="Anotações internas..." rows={3} />

                <div className="flex justify-end pt-2">
                  <Button onClick={() => setActiveTab("documentos")}>Próximo →</Button>
                </div>
              </TabsContent>

              {/* DOCUMENTOS */}
              <TabsContent value="documentos" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Upload de imagens (máx. 5MB cada)</p>
                <FileUploadField label="Foto de Perfil" fileKey="foto_perfil" />
                <FileUploadField label="CNH – Frente" fileKey="cnh_frente" />
                <FileUploadField label="CNH – Verso" fileKey="cnh_verso" />
                <FileUploadField label="Comprovante de Residência" fileKey="comprovante_residencia" />
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setActiveTab("pessoal")}>← Anterior</Button>
                  <Button onClick={() => setActiveTab("pagamento")}>Próximo →</Button>
                </div>
              </TabsContent>

              {/* PAGAMENTO */}
              <TabsContent value="pagamento" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Dados bancários para repasse</p>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Tipo de Pagamento</Label>
                    <Select value={form.tipo_pagamento} onValueChange={(v) => setField("tipo_pagamento", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="conta_bancaria">Conta Bancária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.tipo_pagamento === "pix" && (
                    <div className="grid gap-2">
                      <Label>Chave PIX</Label>
                      <Input value={form.chave_pix} onChange={(e) => setField("chave_pix", e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
                    </div>
                  )}

                  {form.tipo_pagamento === "conta_bancaria" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Banco</Label>
                          <Input value={form.banco} onChange={(e) => setField("banco", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Agência</Label>
                          <Input value={form.agencia} onChange={(e) => setField("agencia", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Conta</Label>
                          <Input value={form.conta} onChange={(e) => setField("conta", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Tipo de Conta</Label>
                          <Select value={form.tipo_conta} onValueChange={(v) => setField("tipo_conta", v)}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              {TIPO_CONTA_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Nome Completo do Recebedor</Label>
                          <Input value={form.nome_recebedor} onChange={(e) => setField("nome_recebedor", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>CPF/CNPJ do Recebedor</Label>
                          <Input value={form.cpf_cnpj_recebedor} onChange={(e) => setField("cpf_cnpj_recebedor", e.target.value)} placeholder="000.000.000-00" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setActiveTab("documentos")}>← Anterior</Button>
                  <Button onClick={() => setActiveTab("veiculo")}>Próximo →</Button>
                </div>
              </TabsContent>

              {/* VEÍCULO */}
              <TabsContent value="veiculo" className="space-y-4 mt-4">
                <div className="flex items-center gap-3 pb-2">
                  <Switch checked={form.possui_veiculo} onCheckedChange={(v) => setField("possui_veiculo", v)} />
                  <Label>Este motorista possui veículo próprio</Label>
                </div>

                {form.possui_veiculo && !editingId && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-muted-foreground">Dados do Veículo</p>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Marca *</Label>
                          <Input value={form.v_marca} onChange={(e) => setField("v_marca", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Modelo *</Label>
                          <Input value={form.v_modelo} onChange={(e) => setField("v_modelo", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-2">
                          <Label>Ano *</Label>
                          <Input type="number" value={form.v_ano} onChange={(e) => setField("v_ano", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Cor</Label>
                          <Input value={form.v_cor} onChange={(e) => setField("v_cor", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Placa *</Label>
                          <Input value={form.v_placa} onChange={(e) => setField("v_placa", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-2">
                          <Label>Combustível</Label>
                          <Select value={form.v_combustivel} onValueChange={(v) => setField("v_combustivel", v)}>
                            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                              {COMBUSTIVEL_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>RENAVAM</Label>
                          <Input value={form.v_renavam} onChange={(e) => setField("v_renavam", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Chassi</Label>
                          <Input value={form.v_chassi} onChange={(e) => setField("v_chassi", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Status do Veículo</Label>
                        <Select value={form.v_status} onValueChange={(v) => setField("v_status", v)}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-muted-foreground pt-2">Documentos do Veículo</p>
                    <FileUploadField label="CRLV" fileKey="crlv" />
                    <FileUploadField label="Seguro" fileKey="seguro" />

                    <p className="text-sm font-semibold text-muted-foreground pt-2">Observações do Veículo</p>
                    <Textarea value={form.v_observacoes} onChange={(e) => setField("v_observacoes", e.target.value)} placeholder="Anotações sobre o veículo..." rows={3} />
                  </div>
                )}

                {form.possui_veiculo && editingId && (
                  <p className="text-sm text-muted-foreground">Veículos são gerenciados na tela de detalhes do motorista.</p>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("pagamento")}>← Anterior</Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Salvar Motorista"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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
          {filtered.map((m) => (
            <Card key={m.id} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                  {m.foto_perfil_url ? (
                    <img src={m.foto_perfil_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{m.nome_completo}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{m.cpf} · CNH {m.cnh_categoria || "—"}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[m.status] || "bg-muted text-muted-foreground"}`}>
                  {m.status}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {m.telefone}
                </div>
                {m.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {m.email}
                  </div>
                )}
                {m.possui_veiculo && (
                  <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" /> Possui veículo próprio
                  </div>
                )}
                <div className="flex items-center gap-1 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(m)} className="h-7 text-xs">
                    <Eye className="h-3 w-3 mr-1" /> Detalhes
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(m)} className="h-7 text-xs">
                    <Edit className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setComunicando(m)} className="h-7 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" /> Comunicar
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-7 w-7 ml-auto">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum motorista cadastrado.
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CNH</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {m.foto_perfil_url ? (
                        <img src={m.foto_perfil_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{m.nome_completo}</p>
                        {m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.cpf}</TableCell>
                  <TableCell className="text-sm">{m.telefone}</TableCell>
                  <TableCell className="text-sm">{m.cnh_categoria || "—"}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[m.status] || "bg-muted text-muted-foreground"}`}>
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(m)} className="h-7 w-7" title="Detalhes">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(m)} className="h-7 w-7" title="Editar">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setComunicando(m)} className="h-7 w-7" title="Comunicar">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-7 w-7" title="Excluir">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum motorista cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* DETAIL DIALOG */}
      <Dialog open={!!detailMotorista} onOpenChange={(open) => { if (!open) { setDetailMotorista(null); setDetailVeiculos([]); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailMotorista && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {detailMotorista.foto_perfil_url ? (
                    <img src={detailMotorista.foto_perfil_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <span>{detailMotorista.nome_completo}</span>
                    <p className="text-xs font-normal text-muted-foreground mt-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[detailMotorista.status] || "bg-muted text-muted-foreground"}`}>
                        {detailMotorista.status}
                      </span>
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground">Dados Pessoais</p>
                <div className="space-y-0">
                  <DetailRow label="CPF" value={detailMotorista.cpf} />
                  <DetailRow label="RG" value={detailMotorista.rg} />
                  <DetailRow label="Data de Nascimento" value={detailMotorista.data_nascimento} />
                  <DetailRow label="Telefone" value={detailMotorista.telefone} />
                  <DetailRow label="E-mail" value={detailMotorista.email} />
                  <DetailRow label="Endereço" value={detailMotorista.endereco} />
                  <DetailRow label="Cidade" value={detailMotorista.cidade} />
                  <DetailRow label="Estado" value={detailMotorista.estado} />
                  <DetailRow label="CEP" value={detailMotorista.cep} />
                </div>

                <p className="text-sm font-semibold text-muted-foreground pt-2">CNH</p>
                <div className="space-y-0">
                  <DetailRow label="Número" value={detailMotorista.cnh_numero} />
                  <DetailRow label="Categoria" value={detailMotorista.cnh_categoria} />
                  <DetailRow label="Validade" value={detailMotorista.cnh_validade} />
                </div>

                {detailMotorista.tipo_pagamento && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Pagamento</p>
                    <div className="space-y-0">
                      <DetailRow label="Tipo" value={detailMotorista.tipo_pagamento === "pix" ? "PIX" : "Conta Bancária"} />
                      {detailMotorista.tipo_pagamento === "pix" && <DetailRow label="Chave PIX" value={detailMotorista.chave_pix} />}
                      {detailMotorista.tipo_pagamento === "conta_bancaria" && (
                        <>
                          <DetailRow label="Banco" value={detailMotorista.banco} />
                          <DetailRow label="Agência" value={detailMotorista.agencia} />
                          <DetailRow label="Conta" value={detailMotorista.conta} />
                          <DetailRow label="Tipo de Conta" value={detailMotorista.tipo_conta} />
                          <DetailRow label="Nome Recebedor" value={detailMotorista.nome_recebedor} />
                          <DetailRow label="CPF/CNPJ Recebedor" value={detailMotorista.cpf_cnpj_recebedor} />
                        </>
                      )}
                    </div>
                  </>
                )}

                {detailMotorista.observacoes && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Observações</p>
                    <p className="text-sm">{detailMotorista.observacoes}</p>
                  </>
                )}

                {detailVeiculos.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground pt-2">Veículos</p>
                    {detailVeiculos.map((v) => (
                      <Card key={v.id} className="p-3">
                        <p className="font-medium text-sm">{v.marca} {v.modelo} ({v.ano})</p>
                        <p className="text-xs text-muted-foreground">Placa: {v.placa} · {v.combustivel || "—"} · {v.cor || "—"}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize mt-1 inline-block ${statusColor[v.status] || "bg-muted text-muted-foreground"}`}>
                          {v.status}
                        </span>
                      </Card>
                    ))}
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { handleEdit(detailMotorista); setDetailMotorista(null); }}>
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
        titulo={comunicando ? `Comunicar com ${comunicando.nome_completo}` : undefined}
        payload={comunicando ? {
          tipo: "motorista_cadastrado",
          id: comunicando.id,
          nome: comunicando.nome_completo,
          cpf: comunicando.cpf,
          telefone: comunicando.telefone,
          email: comunicando.email,
          cidade: comunicando.cidade,
          estado: comunicando.estado,
          status: comunicando.status,
        } : {}}
      />
    </div>
  );
}
