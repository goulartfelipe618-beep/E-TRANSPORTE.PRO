import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Trash2, UserCheck, UserX, ArrowRightLeft, User, FileText, CreditCard, Car, Upload, X, RefreshCw, MessageSquare } from "lucide-react";
import ComunicarDialog from "@/components/ComunicarDialog";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const CNH_CATEGORIAS = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];
const COMBUSTIVEL_OPTIONS = ["Gasolina", "Etanol", "Flex", "Diesel", "GNV", "Elétrico", "Híbrido"];
const TIPO_CONTA_OPTIONS = ["Corrente", "Poupança"];

interface SolicitacaoMotorista {
  id: string;
  nome_completo: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  cnh_categoria: string | null;
  cnh_numero: string | null;
  possui_veiculo: boolean;
  veiculo_marca: string | null;
  veiculo_modelo: string | null;
  veiculo_ano: string | null;
  veiculo_placa: string | null;
  experiencia: string | null;
  mensagem: string | null;
  status: string;
  created_at: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  aprovada: { label: "Aprovada", variant: "default" },
  rejeitada: { label: "Rejeitada", variant: "destructive" },
  convertida: { label: "Convertida", variant: "secondary" },
};

const emptyForm = {
  nome_completo: "", cpf: "", rg: "", data_nascimento: "", telefone: "", email: "",
  endereco: "", cidade: "", estado: "", cep: "",
  cnh_numero: "", cnh_categoria: "", cnh_validade: "", status: "ativo", observacoes: "",
  tipo_pagamento: "", banco: "", agencia: "", conta: "", tipo_conta: "", chave_pix: "",
  possui_veiculo: false,
  v_marca: "", v_modelo: "", v_ano: "", v_cor: "", v_placa: "", v_combustivel: "",
  v_renavam: "", v_chassi: "", v_status: "ativo", v_observacoes: "",
};

export default function MotoristasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMotorista[]>([]);
  const [selected, setSelected] = useState<SolicitacaoMotorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertSource, setConvertSource] = useState<SolicitacaoMotorista | null>(null);
  const [activeTab, setActiveTab] = useState("pessoal");
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({
    foto_perfil: null, cnh_frente: null, cnh_verso: null, comprovante_residencia: null,
    crlv: null, seguro: null,
  });
  const [comunicando, setComunicando] = useState<SolicitacaoMotorista | null>(null);
  const { toast } = useToast();

  const fetchSolicitacoes = async () => {
    const { data, error } = await supabase
      .from("solicitacoes_motorista")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSolicitacoes(data as SolicitacaoMotorista[]);
    setLoading(false);
  };

  useEffect(() => { fetchSolicitacoes(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("solicitacoes_motorista").delete().eq("id", id);
    if (!error) {
      toast({ title: "Solicitação excluída" });
      fetchSolicitacoes();
      setSelected(null);
    }
  };

  const handleStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("solicitacoes_motorista").update({ status: newStatus } as any).eq("id", id);
    if (!error) {
      toast({ title: `Solicitação ${newStatus === "aprovada" ? "aprovada" : "rejeitada"}` });
      fetchSolicitacoes();
      setSelected(null);
    }
  };

  const openConvert = (sol: SolicitacaoMotorista) => {
    setConvertSource(sol);
    setForm({
      ...emptyForm,
      nome_completo: sol.nome_completo || "",
      cpf: sol.cpf || "",
      telefone: sol.telefone || "",
      email: sol.email || "",
      cidade: sol.cidade || "",
      estado: sol.estado || "",
      cnh_numero: sol.cnh_numero || "",
      cnh_categoria: sol.cnh_categoria || "",
      possui_veiculo: sol.possui_veiculo || false,
      v_marca: sol.veiculo_marca || "",
      v_modelo: sol.veiculo_modelo || "",
      v_ano: sol.veiculo_ano || "",
      v_placa: sol.veiculo_placa || "",
    });
    setActiveTab("pessoal");
    setFiles({ foto_perfil: null, cnh_frente: null, cnh_verso: null, comprovante_residencia: null, crlv: null, seguro: null });
    setConvertOpen(true);
    setSelected(null);
  };

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const uploadFile = async (file: File, folder: string, motoristaId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${motoristaId}/${folder}.${ext}`;
    const { error } = await supabase.storage.from("motorista-documentos").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("motorista-documentos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSaveMotorista = async () => {
    if (!form.nome_completo || !form.cpf || !form.telefone) {
      sonnerToast.error("Preencha os campos obrigatórios: Nome, CPF e Telefone.");
      return;
    }
    setSaving(true);
    try {
      const { data: motorista, error } = await (supabase as any).from("motoristas").insert({
        nome_completo: form.nome_completo,
        cpf: form.cpf,
        rg: form.rg || null,
        data_nascimento: form.data_nascimento || null,
        telefone: form.telefone,
        email: form.email || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        cep: form.cep || null,
        cnh_numero: form.cnh_numero || null,
        cnh_categoria: form.cnh_categoria || null,
        cnh_validade: form.cnh_validade || null,
        status: form.status,
        observacoes: form.observacoes || null,
        tipo_pagamento: form.tipo_pagamento || null,
        banco: form.banco || null,
        agencia: form.agencia || null,
        conta: form.conta || null,
        tipo_conta: form.tipo_conta || null,
        chave_pix: form.chave_pix || null,
        possui_veiculo: form.possui_veiculo,
      }).select().single();

      if (error) throw error;
      const mid = motorista.id;

      const docUpdates: Record<string, string> = {};
      if (files.foto_perfil) docUpdates.foto_perfil_url = await uploadFile(files.foto_perfil, "foto-perfil", mid);
      if (files.cnh_frente) docUpdates.cnh_frente_url = await uploadFile(files.cnh_frente, "cnh-frente", mid);
      if (files.cnh_verso) docUpdates.cnh_verso_url = await uploadFile(files.cnh_verso, "cnh-verso", mid);
      if (files.comprovante_residencia) docUpdates.comprovante_residencia_url = await uploadFile(files.comprovante_residencia, "comprovante", mid);

      if (Object.keys(docUpdates).length > 0) {
        await (supabase as any).from("motoristas").update(docUpdates).eq("id", mid);
      }

      if (form.possui_veiculo && form.v_marca && form.v_modelo && form.v_placa && form.v_ano) {
        const vehicleData: any = {
          motorista_id: mid,
          marca: form.v_marca,
          modelo: form.v_modelo,
          ano: parseInt(form.v_ano),
          cor: form.v_cor || null,
          placa: form.v_placa,
          combustivel: form.v_combustivel || null,
          renavam: form.v_renavam || null,
          chassi: form.v_chassi || null,
          status: form.v_status,
          observacoes: form.v_observacoes || null,
        };
        if (files.crlv) vehicleData.crlv_url = await uploadFile(files.crlv, "crlv", mid);
        if (files.seguro) vehicleData.seguro_url = await uploadFile(files.seguro, "seguro", mid);
        await (supabase as any).from("motorista_veiculos").insert(vehicleData);
      }

      // Mark solicitacao as converted
      if (convertSource) {
        await supabase.from("solicitacoes_motorista").update({ status: "convertida" } as any).eq("id", convertSource.id);
      }

      sonnerToast.success("Motorista cadastrado com sucesso!");
      setConvertOpen(false);
      setConvertSource(null);
      setForm({ ...emptyForm });
      fetchSolicitacoes();
    } catch (err: any) {
      sonnerToast.error(err.message || "Erro ao cadastrar motorista.");
    } finally {
      setSaving(false);
    }
  };

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
                sonnerToast.error("Arquivo deve ter no máximo 5MB.");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitações de Motoristas</h1>
          <p className="text-muted-foreground">Solicitações recebidas de pessoas que desejam ser motoristas parceiros.</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => { setLoading(true); fetchSolicitacoes(); }} title="Recarregar">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Solicitações Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : solicitacoes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma solicitação recebida.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Veículo Próprio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(sol.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{sol.nome_completo}</TableCell>
                    <TableCell>{sol.telefone || "—"}</TableCell>
                    <TableCell>{[sol.cidade, sol.estado].filter(Boolean).join("/") || "—"}</TableCell>
                    <TableCell>{sol.cnh_categoria || "—"}</TableCell>
                    <TableCell>{sol.possui_veiculo ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[sol.status]?.variant || "outline"}>
                        {statusMap[sol.status]?.label || sol.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(sol)} title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setComunicando(sol)} title="Comunicar">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Comunicar
                        </Button>
                        {sol.status === "pendente" && (
                          <>
                            <Button variant="default" size="sm" onClick={() => handleStatus(sol.id, "aprovada")} title="Aprovar">
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Aprovar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleStatus(sol.id, "rejeitada")} title="Rejeitar">
                              <UserX className="h-3.5 w-3.5 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                        {(sol.status === "aprovada") && (
                          <Button variant="default" size="sm" onClick={() => openConvert(sol)} title="Converter em motorista">
                            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Converter
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir solicitação?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sol.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Nome Completo" value={selected.nome_completo} />
              <Detail label="CPF" value={selected.cpf || "—"} />
              <Detail label="Telefone" value={selected.telefone || "—"} />
              <Detail label="E-mail" value={selected.email || "—"} />
              <Detail label="Cidade" value={selected.cidade || "—"} />
              <Detail label="Estado" value={selected.estado || "—"} />

              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-foreground mb-1">Habilitação</p>
              </div>
              <Detail label="CNH Número" value={selected.cnh_numero || "—"} />
              <Detail label="Categoria" value={selected.cnh_categoria || "—"} />

              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-foreground mb-1">Veículo</p>
              </div>
              <Detail label="Possui Veículo" value={selected.possui_veiculo ? "Sim" : "Não"} />
              {selected.possui_veiculo && (
                <>
                  <Detail label="Marca" value={selected.veiculo_marca || "—"} />
                  <Detail label="Modelo" value={selected.veiculo_modelo || "—"} />
                  <Detail label="Ano" value={selected.veiculo_ano || "—"} />
                  <Detail label="Placa" value={selected.veiculo_placa || "—"} />
                </>
              )}

              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-foreground mb-1">Informações Adicionais</p>
              </div>
              <Detail label="Experiência" value={selected.experiencia || "—"} />
              <Detail label="Mensagem" value={selected.mensagem || "—"} />

              <Detail label="Status" value={statusMap[selected.status]?.label || selected.status} />
              <Detail label="Recebido em" value={new Date(selected.created_at).toLocaleString("pt-BR")} />

              <div className="flex gap-2 mt-2 flex-wrap">
                {selected.status === "pendente" && (
                  <>
                    <Button className="flex-1" onClick={() => handleStatus(selected.id, "aprovada")}>
                      <UserCheck className="h-4 w-4 mr-2" /> Aprovar
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleStatus(selected.id, "rejeitada")}>
                      <UserX className="h-4 w-4 mr-2" /> Rejeitar
                    </Button>
                  </>
                )}
                {selected.status === "aprovada" && (
                  <Button className="flex-1" onClick={() => openConvert(selected)}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Converter em Motorista
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert to Motorista Dialog — full cadastro form */}
      <Dialog open={convertOpen} onOpenChange={(open) => { if (!open) { setConvertOpen(false); setConvertSource(null); setActiveTab("pessoal"); setForm({ ...emptyForm }); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Converter em Motorista Oficial</DialogTitle>
            <DialogDescription>
              Dados pré-preenchidos da solicitação. Complete as informações restantes e salve.
            </DialogDescription>
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
                      <SelectItem value="ted">TED</SelectItem>
                      <SelectItem value="conta_bancaria">Conta Bancária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="grid gap-2">
                  <Label>Chave PIX</Label>
                  <Input value={form.chave_pix} onChange={(e) => setField("chave_pix", e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
                </div>
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

              {form.possui_veiculo && (
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

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab("pagamento")}>← Anterior</Button>
                <Button onClick={handleSaveMotorista} disabled={saving}>
                  {saving ? "Salvando..." : "Cadastrar Motorista"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ComunicarDialog
        open={!!comunicando}
        onClose={() => setComunicando(null)}
        titulo={comunicando ? `Comunicar com ${comunicando.nome_completo}` : undefined}
        payload={comunicando ? {
          tipo: "solicitacao_motorista",
          id: comunicando.id,
          nome: comunicando.nome_completo,
          cpf: comunicando.cpf,
          telefone: comunicando.telefone,
          email: comunicando.email,
          cidade: comunicando.cidade,
          estado: comunicando.estado,
          cnh_categoria: comunicando.cnh_categoria,
          possui_veiculo: comunicando.possui_veiculo,
          status: comunicando.status,
        } : {}}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  );
}
