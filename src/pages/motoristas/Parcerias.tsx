import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Building2, FileText, Car, Users, Upload, X, Phone, Mail, Trash2, Save, MessageSquare } from "lucide-react";
import ComunicarDialog from "@/components/ComunicarDialog";
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
}

const emptyVeiculo = (): VeiculoForm => ({
  marca: "", modelo: "", ano: new Date().getFullYear().toString(), placa: "", cor: "",
  combustivel: "", renavam: "", status: "ativo", crlv: null, seguro: null,
});

const emptySubparceiro = (): SubparceiroForm => ({
  nome: "", cpf_cnpj: "", telefone: "", email: "", funcao: "", observacoes: "",
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

  const fetchParceiros = async () => {
    const { data } = await (supabase as any).from("parceiros").select("*").order("created_at", { ascending: false });
    if (data) setParceiros(data);
  };

  useEffect(() => { fetchParceiros(); }, []);

  const uploadFile = async (file: File, folder: string, parceiroId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${parceiroId}/${folder}.${ext}`;
    const { error } = await supabase.storage.from("parceiro-documentos").upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("parceiro-documentos").getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.razao_social || !form.cnpj) {
      toast.error("Preencha os campos obrigatórios: Razão Social e CNPJ.");
      return;
    }
    setLoading(true);
    try {
      const { data: parceiro, error } = await (supabase as any).from("parceiros").insert({
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        cnpj: form.cnpj,
        inscricao_estadual: form.inscricao_estadual || null,
        email: form.email || null,
        telefone: form.telefone || null,
        whatsapp: form.whatsapp || null,
        status: form.status,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        cep: form.cep || null,
        responsavel_nome: form.responsavel_nome || null,
        responsavel_telefone: form.responsavel_telefone || null,
        responsavel_email: form.responsavel_email || null,
        observacoes: form.observacoes || null,
      }).select().single();
      if (error) throw error;
      const pid = parceiro.id;

      // Upload docs
      const docUpdates: Record<string, string> = {};
      if (files.logo) docUpdates.logo_url = await uploadFile(files.logo, "logo", pid);
      if (files.contrato) docUpdates.contrato_url = await uploadFile(files.contrato, "contrato", pid);
      if (Object.keys(docUpdates).length > 0) {
        await (supabase as any).from("parceiros").update(docUpdates).eq("id", pid);
      }

      // Insert vehicles
      for (const v of veiculos) {
        if (!v.marca || !v.modelo || !v.placa) continue;
        const vData: any = {
          parceiro_id: pid, marca: v.marca, modelo: v.modelo,
          ano: parseInt(v.ano) || null, placa: v.placa, cor: v.cor || null,
          combustivel: v.combustivel || null, renavam: v.renavam || null, status: v.status,
        };
        if (v.crlv) vData.crlv_url = await uploadFile(v.crlv, `veiculo-crlv-${v.placa}`, pid);
        if (v.seguro) vData.seguro_url = await uploadFile(v.seguro, `veiculo-seguro-${v.placa}`, pid);
        await (supabase as any).from("parceiro_veiculos").insert(vData);
      }

      // Insert subparceiros
      for (const s of subparceiros) {
        if (!s.nome) continue;
        await (supabase as any).from("subparceiros").insert({
          parceiro_id: pid, nome: s.nome, cpf_cnpj: s.cpf_cnpj || null,
          telefone: s.telefone || null, email: s.email || null,
          funcao: s.funcao || null, observacoes: s.observacoes || null,
        });
      }

      toast.success("Parceiro cadastrado com sucesso!");
      resetForm();
      setDialogOpen(false);
      fetchParceiros();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar parceiro.");
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

  const ImageUploadField = ({ label, fileKey }: { label: string; fileKey: "logo" | "contrato" }) => (
    <div className="grid gap-2">
      <Label className="font-semibold">{label}</Label>
      <label className="cursor-pointer">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors min-h-[140px]">
          {files[fileKey] ? (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <FileText className="h-5 w-5" />
              <span>{files[fileKey]!.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); setFiles((prev) => ({ ...prev, [fileKey]: null })); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clique para selecionar uma imagem</span>
              <span className="text-xs text-muted-foreground">Máximo 5MB</span>
            </>
          )}
        </div>
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.size > 5 * 1024 * 1024) { toast.error("Arquivo deve ter no máximo 5MB."); return; }
          setFiles((prev) => ({ ...prev, [fileKey]: file || null }));
        }} />
      </label>
    </div>
  );

  const VeiculoUploadField = ({ label, index, fileKey }: { label: string; index: number; fileKey: "crlv" | "seguro" }) => (
    <div className="grid gap-2">
      <Label className="font-semibold">{label}</Label>
      <label className="cursor-pointer">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors min-h-[120px]">
          {veiculos[index][fileKey] ? (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-xs">{veiculos[index][fileKey]!.name}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => {
                e.preventDefault();
                setVeiculos((prev) => prev.map((v, i) => i === index ? { ...v, [fileKey]: null } : v));
              }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clique para selecionar uma imagem</span>
              <span className="text-xs text-muted-foreground">Máximo 5MB</span>
            </>
          )}
        </div>
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.size > 5 * 1024 * 1024) { toast.error("Arquivo máx 5MB."); return; }
          setVeiculos((prev) => prev.map((v, i) => i === index ? { ...v, [fileKey]: file || null } : v));
        }} />
      </label>
    </div>
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
              <DialogTitle>Novo Parceiro</DialogTitle>
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
                    <Input value={form.inscricao_estadual} onChange={(e) => setField("inscricao_estadual", e.target.value)} placeholder="Inscrição estadual" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold">E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@empresa.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Telefone</Label>
                    <Input value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} placeholder="(00) 0000-0000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold">WhatsApp</Label>
                    <Input value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} placeholder="(00) 0 0000-0000" />
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
                    <div className="grid gap-2">
                      <Label className="font-semibold">Endereço Completo</Label>
                      <Input value={form.endereco} onChange={(e) => setField("endereco", e.target.value)} placeholder="Rua, número, complemento, bairro" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-2">
                        <Label className="font-semibold">Cidade</Label>
                        <Input value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} placeholder="Cidade" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-semibold">Estado</Label>
                        <Select value={form.estado} onValueChange={(v) => setField("estado", v)}>
                          <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                          <SelectContent>
                            {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-semibold">CEP</Label>
                        <Input value={form.cep} onChange={(e) => setField("cep", e.target.value)} placeholder="00000-000" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Responsável</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label className="font-semibold">Nome</Label>
                      <Input value={form.responsavel_nome} onChange={(e) => setField("responsavel_nome", e.target.value)} placeholder="Nome do responsável" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-semibold">Telefone</Label>
                      <Input value={form.responsavel_telefone} onChange={(e) => setField("responsavel_telefone", e.target.value)} placeholder="(00) 0 0000-0000" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-semibold">E-mail</Label>
                      <Input type="email" value={form.responsavel_email} onChange={(e) => setField("responsavel_email", e.target.value)} placeholder="email@responsavel.com" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="font-semibold">Observações</Label>
                  <Textarea className="mt-2" value={form.observacoes} onChange={(e) => setField("observacoes", e.target.value)} placeholder="Observações sobre o parceiro..." rows={3} />
                </div>
              </TabsContent>

              {/* DOCUMENTOS */}
              <TabsContent value="documentos" className="mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <ImageUploadField label="Logo da Empresa" fileKey="logo" />
                  <ImageUploadField label="Contrato" fileKey="contrato" />
                </div>
              </TabsContent>

              {/* VEÍCULOS */}
              <TabsContent value="veiculos" className="space-y-4 mt-4">
                {veiculos.map((v, idx) => (
                  <Card key={idx} className="border shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Adicionar Veículo {veiculos.length > 1 ? `#${idx + 1}` : ""}</CardTitle>
                      {veiculos.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVeiculos((prev) => prev.filter((_, i) => i !== idx))}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="grid gap-2">
                          <Label className="font-semibold">Marca *</Label>
                          <Input value={v.marca} onChange={(e) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, marca: e.target.value } : ve))} placeholder="Ex: Toyota" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Modelo *</Label>
                          <Input value={v.modelo} onChange={(e) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, modelo: e.target.value } : ve))} placeholder="Ex: Corolla" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Ano</Label>
                          <Input type="number" value={v.ano} onChange={(e) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, ano: e.target.value } : ve))} />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Placa *</Label>
                          <Input value={v.placa} onChange={(e) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, placa: e.target.value } : ve))} placeholder="ABC1D23" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="grid gap-2">
                          <Label className="font-semibold">Cor</Label>
                          <Input value={v.cor} onChange={(e) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, cor: e.target.value } : ve))} placeholder="Ex: Preto" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Combustível</Label>
                          <Select value={v.combustivel} onValueChange={(val) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, combustivel: val } : ve))}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              {COMBUSTIVEL_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Renavam</Label>
                          <Input value={v.renavam} onChange={(e) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, renavam: e.target.value } : ve))} placeholder="Número do Renavam" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Status</Label>
                          <Select value={v.status} onValueChange={(val) => setVeiculos((prev) => prev.map((ve, i) => i === idx ? { ...ve, status: val } : ve))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <VeiculoUploadField label="CRLV" index={idx} fileKey="crlv" />
                        <VeiculoUploadField label="Seguro" index={idx} fileKey="seguro" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setVeiculos((prev) => [...prev, emptyVeiculo()])}>
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubparceiros((prev) => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-2">
                          <Label className="font-semibold">Nome *</Label>
                          <Input value={s.nome} onChange={(e) => setSubparceiros((prev) => prev.map((sp, i) => i === idx ? { ...sp, nome: e.target.value } : sp))} />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">CPF/CNPJ</Label>
                          <Input value={s.cpf_cnpj} onChange={(e) => setSubparceiros((prev) => prev.map((sp, i) => i === idx ? { ...sp, cpf_cnpj: e.target.value } : sp))} />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">Função</Label>
                          <Input value={s.funcao} onChange={(e) => setSubparceiros((prev) => prev.map((sp, i) => i === idx ? { ...sp, funcao: e.target.value } : sp))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label className="font-semibold">Telefone</Label>
                          <Input value={s.telefone} onChange={(e) => setSubparceiros((prev) => prev.map((sp, i) => i === idx ? { ...sp, telefone: e.target.value } : sp))} />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-semibold">E-mail</Label>
                          <Input type="email" value={s.email} onChange={(e) => setSubparceiros((prev) => prev.map((sp, i) => i === idx ? { ...sp, email: e.target.value } : sp))} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setSubparceiros((prev) => [...prev, emptySubparceiro()])}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Subparceiro
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por razão social, fantasia ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* List */}
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
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[p.status] || "bg-muted text-muted-foreground"}`}>
                  {p.status}
                </span>
                <Button variant="outline" size="sm" onClick={() => setComunicando(p)} title="Comunicar" className="h-7 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> Comunicar
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-7 w-7">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {p.telefone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {p.telefone}
                </div>
              )}
              {p.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {p.email}
                </div>
              )}
              {p.responsavel_nome && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Responsável: <span className="text-foreground font-medium">{p.responsavel_nome}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum parceiro cadastrado.
          </div>
        )}
      </div>

      <ComunicarDialog
        open={!!comunicando}
        onClose={() => setComunicando(null)}
        titulo={comunicando ? `Comunicar com ${comunicando.nome_fantasia || comunicando.razao_social}` : undefined}
        payload={comunicando ? {
          tipo: "parceiro",
          id: comunicando.id,
          razao_social: comunicando.razao_social,
          nome_fantasia: comunicando.nome_fantasia,
          cnpj: comunicando.cnpj,
          telefone: comunicando.telefone,
          whatsapp: comunicando.whatsapp,
          email: comunicando.email,
          responsavel_nome: comunicando.responsavel_nome,
          responsavel_telefone: comunicando.responsavel_telefone,
          status: comunicando.status,
        } : {}}
      />
    </div>
  );
}
