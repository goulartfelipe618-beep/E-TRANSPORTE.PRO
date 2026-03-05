import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, Eye, Pencil, Trash2, CheckCircle, Clock, AlertTriangle, XCircle,
  Building2, MapPin, Phone, CalendarClock, Camera, Send, ChevronRight, ChevronLeft, RefreshCw
} from "lucide-react";

const ETAPAS = [
  { num: 1, title: "Informações Básicas", icon: Building2 },
  { num: 2, title: "Localização", icon: MapPin },
  { num: 3, title: "Contato", icon: Phone },
  { num: 4, title: "Horário de Funcionamento", icon: CalendarClock },
  { num: 5, title: "Fotos", icon: Camera },
];

const CATEGORIAS_GOOGLE = [
  "Serviço de transporte",
  "Serviço de transporte executivo",
  "Serviço de transfer",
  "Serviço de motorista particular",
  "Serviço de locação de veículos",
  "Agência de turismo",
  "Serviço de limusine",
  "Serviço de transporte de passageiros",
];

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const PALAVRAS_PROIBIDAS = ["grátis", "melhor", "#1", "barato", "promoção", "desconto", "oficial"];

type Profile = {
  id: string;
  entidade_tipo: string;
  entidade_id: string | null;
  nome_empresa: string;
  categoria_principal: string | null;
  categoria_secundaria: string | null;
  descricao: string | null;
  endereco: string | null;
  area_atendimento: string | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  whatsapp: string | null;
  website: string | null;
  horario_padrao: any;
  horarios_especiais: any;
  logo_url: string | null;
  capa_url: string | null;
  fotos_url: string[] | null;
  google_location_name: string | null;
  verification_status: string;
  service_area_business: boolean;
  etapa_atual: number;
  dados_validados: boolean;
  api_errors: any;
  created_at: string;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "verificado": return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">🟢 Verificado</Badge>;
    case "pendente": return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🟡 Pendente</Badge>;
    case "suspenso": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔴 Suspenso</Badge>;
    case "enviado": return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">📤 Enviado</Badge>;
    default: return <Badge variant="outline">⚪ Não Enviado</Badge>;
  }
}

function validarNome(nome: string): string[] {
  const erros: string[] = [];
  if (nome.length < 3) erros.push("Nome muito curto (mínimo 3 caracteres)");
  if (nome.length > 100) erros.push("Nome muito longo (máximo 100 caracteres)");
  PALAVRAS_PROIBIDAS.forEach(p => {
    if (nome.toLowerCase().includes(p)) erros.push(`Palavra proibida encontrada: "${p}"`);
  });
  if (/[!@#$%^&*()+=\[\]{}|\\/<>]/.test(nome)) erros.push("Caracteres especiais não permitidos");
  return erros;
}

export default function GoogleBusiness() {
  const tenantId = useTenantId();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showWizard, setShowWizard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form state
  const [form, setForm] = useState({
    entidade_tipo: "motorista",
    nome_empresa: "",
    categoria_principal: "",
    categoria_secundaria: "",
    descricao: "",
    endereco: "",
    area_atendimento: "",
    cep: "",
    cidade: "",
    estado: "",
    telefone: "",
    whatsapp: "",
    website: "",
    service_area_business: true,
    horario_padrao: {} as Record<string, { aberto: boolean; inicio: string; fim: string }>,
    logo_url: "",
    capa_url: "",
  });

  useEffect(() => {
    // Initialize default schedule
    const defaultSchedule: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
    DIAS_SEMANA.forEach(dia => {
      defaultSchedule[dia] = { aberto: dia !== "Domingo", inicio: "08:00", fim: "18:00" };
    });
    setForm(prev => ({ ...prev, horario_padrao: defaultSchedule }));
  }, []);

  const fetchProfiles = async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase
      .from("google_business_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (data) setProfiles(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, [tenantId]);

  const resetForm = () => {
    const defaultSchedule: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
    DIAS_SEMANA.forEach(dia => {
      defaultSchedule[dia] = { aberto: dia !== "Domingo", inicio: "08:00", fim: "18:00" };
    });
    setForm({
      entidade_tipo: "motorista", nome_empresa: "", categoria_principal: "", categoria_secundaria: "",
      descricao: "", endereco: "", area_atendimento: "", cep: "", cidade: "", estado: "",
      telefone: "", whatsapp: "", website: "", service_area_business: true,
      horario_padrao: defaultSchedule, logo_url: "", capa_url: "",
    });
    setWizardStep(1);
    setEditingId(null);
    setValidationErrors([]);
  };

  const handleSave = async () => {
    const errors = validarNome(form.nome_empresa);
    if (!form.categoria_principal) errors.push("Categoria principal é obrigatória");
    if (!form.telefone) errors.push("Telefone é obrigatório");
    if (!form.service_area_business && !form.endereco) errors.push("Endereço é obrigatório para negócios com ponto fixo");
    if (form.service_area_business && !form.area_atendimento) errors.push("Área de atendimento é obrigatória para Service Area Business");

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({ title: "Erros de validação", description: `${errors.length} problema(s) encontrado(s)`, variant: "destructive" });
      return;
    }

    const payload = {
      tenant_id: tenantId,
      entidade_tipo: form.entidade_tipo,
      nome_empresa: form.nome_empresa.trim(),
      categoria_principal: form.categoria_principal,
      categoria_secundaria: form.categoria_secundaria || null,
      descricao: form.descricao || null,
      endereco: form.endereco || null,
      area_atendimento: form.area_atendimento || null,
      cep: form.cep || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      telefone: form.telefone,
      whatsapp: form.whatsapp || null,
      website: form.website || null,
      service_area_business: form.service_area_business,
      horario_padrao: form.horario_padrao,
      logo_url: form.logo_url || null,
      capa_url: form.capa_url || null,
      etapa_atual: 5,
      dados_validados: true,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("google_business_profiles").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("google_business_profiles").insert(payload));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Perfil atualizado!" : "Perfil criado!" });
      setShowWizard(false);
      resetForm();
      fetchProfiles();
    }
  };

  const handleEdit = (p: Profile) => {
    setForm({
      entidade_tipo: p.entidade_tipo,
      nome_empresa: p.nome_empresa,
      categoria_principal: p.categoria_principal || "",
      categoria_secundaria: p.categoria_secundaria || "",
      descricao: p.descricao || "",
      endereco: p.endereco || "",
      area_atendimento: p.area_atendimento || "",
      cep: p.cep || "",
      cidade: p.cidade || "",
      estado: p.estado || "",
      telefone: p.telefone || "",
      whatsapp: p.whatsapp || "",
      website: p.website || "",
      service_area_business: p.service_area_business,
      horario_padrao: p.horario_padrao || {},
      logo_url: p.logo_url || "",
      capa_url: p.capa_url || "",
    });
    setEditingId(p.id);
    setWizardStep(1);
    setShowWizard(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("google_business_profiles").delete().eq("id", id);
    toast({ title: "Perfil removido" });
    fetchProfiles();
  };

  const filteredProfiles = profiles.filter(p => {
    const matchSearch = p.nome_empresa.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || p.verification_status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Wizard Steps
  const renderStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Tipo de Entidade</Label>
              <Select value={form.entidade_tipo} onValueChange={v => setForm(f => ({ ...f, entidade_tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorista">Motorista</SelectItem>
                  <SelectItem value="parceiro">Empresa Parceira</SelectItem>
                  <SelectItem value="tenant">Próprio Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome da Empresa *</Label>
              <Input value={form.nome_empresa} onChange={e => setForm(f => ({ ...f, nome_empresa: e.target.value }))} placeholder="Ex: Transfer Executivo São Paulo" />
              {form.nome_empresa && validarNome(form.nome_empresa).length > 0 && (
                <div className="mt-1 space-y-1">
                  {validarNome(form.nome_empresa).map((e, i) => (
                    <p key={i} className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{e}</p>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Categoria Principal *</Label>
              <Select value={form.categoria_principal} onValueChange={v => setForm(f => ({ ...f, categoria_principal: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_GOOGLE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria Secundária</Label>
              <Select value={form.categoria_secundaria} onValueChange={v => setForm(f => ({ ...f, categoria_secundaria: v }))}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_GOOGLE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descreva o serviço oferecido..." rows={3} />
              <p className="text-xs text-muted-foreground mt-1">{form.descricao.length}/750 caracteres</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium">Service Area Business</p>
                <p className="text-xs text-muted-foreground">Ative se o serviço é móvel (sem ponto físico fixo). Recomendado para transporte.</p>
              </div>
              <Switch checked={form.service_area_business} onCheckedChange={v => setForm(f => ({ ...f, service_area_business: v }))} />
            </div>
            {form.service_area_business ? (
              <div>
                <Label>Área de Atendimento *</Label>
                <Input value={form.area_atendimento} onChange={e => setForm(f => ({ ...f, area_atendimento: e.target.value }))} placeholder="Ex: São Paulo, Guarulhos, ABC Paulista" />
                <p className="text-xs text-muted-foreground mt-1">Informe as cidades ou regiões que você atende</p>
              </div>
            ) : (
              <div>
                <Label>Endereço Completo *</Label>
                <Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CEP</Label>
                <Input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} placeholder="00000-000" />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} placeholder="SP" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Telefone *</Label>
              <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://www.exemplo.com.br" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Configure o horário de funcionamento padrão.</p>
            {DIAS_SEMANA.map(dia => {
              const h = form.horario_padrao[dia] || { aberto: true, inicio: "08:00", fim: "18:00" };
              return (
                <div key={dia} className="flex items-center gap-3">
                  <Switch
                    checked={h.aberto}
                    onCheckedChange={v => setForm(f => ({
                      ...f,
                      horario_padrao: { ...f.horario_padrao, [dia]: { ...h, aberto: v } }
                    }))}
                  />
                  <span className="w-20 text-sm">{dia}</span>
                  {h.aberto ? (
                    <>
                      <Input type="time" value={h.inicio} className="w-28" onChange={e => setForm(f => ({
                        ...f,
                        horario_padrao: { ...f.horario_padrao, [dia]: { ...h, inicio: e.target.value } }
                      }))} />
                      <span className="text-muted-foreground text-sm">às</span>
                      <Input type="time" value={h.fim} className="w-28" onChange={e => setForm(f => ({
                        ...f,
                        horario_padrao: { ...f.horario_padrao, [dia]: { ...h, fim: e.target.value } }
                      }))} />
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Fechado</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>URL do Logo</Label>
              <Input value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>URL da Capa</Label>
              <Input value={form.capa_url} onChange={e => setForm(f => ({ ...f, capa_url: e.target.value }))} placeholder="https://..." />
            </div>
            {validationErrors.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-destructive mb-2">⚠️ Problemas de validação:</p>
                  {validationErrors.map((e, i) => (
                    <p key={i} className="text-xs text-destructive">• {e}</p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Google Business Profile</h1>
          <p className="text-muted-foreground">Gerencie perfis para Google Meu Negócio</p>
        </div>
        <Button onClick={() => { resetForm(); setShowWizard(true); }}>
          <Plus className="h-4 w-4 mr-2" />Novo Perfil
        </Button>
      </div>

      {/* Info card */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Building2 className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Como funciona</p>
              <p className="text-muted-foreground mt-1">
                Preencha os dados do perfil no wizard. O sistema valida automaticamente o nome, categoria e endereço
                para reduzir chances de suspensão pelo Google. Motoristas sem ponto fixo devem ser configurados como
                "Service Area Business".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="nao_enviado">Não Enviado</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="verificado">Verificado</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum perfil encontrado</TableCell></TableRow>
              ) : filteredProfiles.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome_empresa}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{p.entidade_tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.categoria_principal || "—"}</TableCell>
                  <TableCell>{getStatusBadge(p.verification_status)}</TableCell>
                  <TableCell>
                    {p.dados_validados ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewingProfile(p)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={v => { if (!v) { setShowWizard(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Perfil" : "Novo Perfil Google Business"}</DialogTitle>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {ETAPAS.map(et => (
              <button
                key={et.num}
                onClick={() => setWizardStep(et.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  wizardStep === et.num
                    ? "bg-primary text-primary-foreground"
                    : wizardStep > et.num
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <et.icon className="h-3.5 w-3.5" />
                {et.title}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 max-h-[55vh] pr-3">
            {renderStep()}
          </ScrollArea>

          <div className="flex justify-between pt-3 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setWizardStep(s => Math.max(1, s - 1))}
              disabled={wizardStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Anterior
            </Button>
            {wizardStep < 5 ? (
              <Button onClick={() => setWizardStep(s => s + 1)}>
                Próximo<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave}>
                <Send className="h-4 w-4 mr-2" />Salvar Perfil
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingProfile?.nome_empresa}</DialogTitle>
          </DialogHeader>
          {viewingProfile && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm capitalize">{viewingProfile.entidade_tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    {getStatusBadge(viewingProfile.verification_status)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categoria</p>
                    <p className="text-sm">{viewingProfile.categoria_principal || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Service Area</p>
                    <p className="text-sm">{viewingProfile.service_area_business ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm">{viewingProfile.telefone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cidade</p>
                    <p className="text-sm">{viewingProfile.cidade || "—"} / {viewingProfile.estado || "—"}</p>
                  </div>
                </div>
                {viewingProfile.descricao && (
                  <div>
                    <p className="text-xs text-muted-foreground">Descrição</p>
                    <p className="text-sm">{viewingProfile.descricao}</p>
                  </div>
                )}
                {viewingProfile.google_location_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Google Location ID</p>
                    <p className="text-sm font-mono">{viewingProfile.google_location_name}</p>
                  </div>
                )}
                {viewingProfile.api_errors && (viewingProfile.api_errors as any[]).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Erros da API</p>
                    {(viewingProfile.api_errors as any[]).map((e: any, i: number) => (
                      <p key={i} className="text-xs text-destructive">• {typeof e === "string" ? e : JSON.stringify(e)}</p>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
