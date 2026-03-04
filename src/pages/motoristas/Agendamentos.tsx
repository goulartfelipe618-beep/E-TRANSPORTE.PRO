import { useState, useEffect, useCallback } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Trash2, Eye, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Agendamento {
  id: string;
  motorista_nome: string;
  motorista_telefone: string;
  motorista_email: string | null;
  tipo_servico: string;
  status: string;
  data_servico: string;
  horario: string;
  local_origem: string | null;
  local_destino: string | null;
  observacoes: string | null;
  created_at: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  agendado: { label: "Agendado", variant: "default" },
  concluido: { label: "Concluído", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const tipoOptions = [
  { value: "reuniao", label: "Reunião" },
  { value: "entrevista", label: "Entrevista" },
  { value: "treinamento", label: "Treinamento" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "outro", label: "Outro" },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const emptyForm = {
  motorista_nome: "",
  motorista_telefone: "",
  motorista_email: "",
  tipo_servico: "reuniao",
  status: "agendado",
  data_servico: "",
  horario: "",
  local_origem: "",
  local_destino: "",
  observacoes: "",
};

export default function MotoristasAgendamentos() {
  const tenantId = useTenantId();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Agendamento | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agendamentos_motorista")
      .select("*")
      .order("data_servico", { ascending: true });
    if (!error && data) setAgendamentos(data);
    else toast.error("Erro ao carregar agendamentos");
    setLoading(false);
  }, []);

  useEffect(() => { fetchAgendamentos(); }, [fetchAgendamentos]);

  const handleCreate = async () => {
    if (!form.motorista_nome || !form.motorista_telefone || !form.data_servico || !form.horario) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    const { error } = await supabase.from("agendamentos_motorista").insert({
      motorista_nome: form.motorista_nome,
      motorista_telefone: form.motorista_telefone,
      motorista_email: form.motorista_email || null,
      tipo_servico: form.tipo_servico,
      status: form.status,
      data_servico: form.data_servico,
      horario: form.horario,
      local_origem: form.local_origem || null,
      local_destino: form.local_destino || null,
      observacoes: form.observacoes || null,
      tenant_id: tenantId,
    });
    if (error) toast.error("Erro ao criar agendamento");
    else { toast.success("Agendamento criado"); setDialogOpen(false); setForm(emptyForm); fetchAgendamentos(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("agendamentos_motorista").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Excluído"); fetchAgendamentos(); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("agendamentos_motorista").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status");
    else { toast.success("Status atualizado"); fetchAgendamentos(); }
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getAgendamentosForDay = (day: Date) =>
    agendamentos.filter((a) => isSameDay(parseISO(a.data_servico), day));

  const statusDotColor = (status: string) => {
    if (status === "agendado") return "bg-primary";
    if (status === "concluido") return "bg-green-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos de Motoristas</h1>
          <p className="text-muted-foreground">Gerenciar reuniões e compromissos com motoristas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAgendamentos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* List */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {agendamentos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentos.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.motorista_nome}</TableCell>
                    <TableCell>{tipoOptions.find((t) => t.value === a.tipo_servico)?.label ?? a.tipo_servico}</TableCell>
                    <TableCell>{format(parseISO(a.data_servico), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{a.horario}</TableCell>
                    <TableCell>
                      <Select value={a.status} onValueChange={(v) => handleStatusChange(a.id, v)}>
                        <SelectTrigger className="w-[130px] h-8">
                          <Badge variant={statusMap[a.status]?.variant ?? "outline"}>
                            {statusMap[a.status]?.label ?? a.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusMap).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setSelected(a); setDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Calendário</CardTitle>
            <p className="text-muted-foreground text-sm">Visualização mensal dos agendamentos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {WEEKDAYS.map((d) => (
              <div key={d} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-card min-h-[80px]" />
            ))}
            {daysInMonth.map((day) => {
              const dayAgendamentos = getAgendamentosForDay(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className="bg-card min-h-[80px] p-1.5 relative">
                  <span className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : "text-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayAgendamentos.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                        onClick={() => { setSelected(a); setDetailOpen(true); }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(a.status)}`} />
                        <span className="text-[10px] truncate text-foreground">{a.horario}</span>
                      </div>
                    ))}
                    {dayAgendamentos.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{dayAgendamentos.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Agendado</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Concluído</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Cancelado</div>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <p className="text-sm text-muted-foreground">Preencha os detalhes para criar um novo agendamento</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nome do Motorista *</Label>
                <Input placeholder="Nome completo" value={form.motorista_nome} onChange={(e) => setForm({ ...form, motorista_nome: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Telefone *</Label>
                <Input placeholder="(00) 00000-0000" value={form.motorista_telefone} onChange={(e) => setForm({ ...form, motorista_telefone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input placeholder="email@exemplo.com" value={form.motorista_email} onChange={(e) => setForm({ ...form, motorista_email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo de Serviço *</Label>
                <Select value={form.tipo_servico} onValueChange={(v) => setForm({ ...form, tipo_servico: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Data do Serviço *</Label>
                <Input type="date" value={form.data_servico} onChange={(e) => setForm({ ...form, data_servico: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Horário *</Label>
                <Input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Local de Origem</Label>
                <AddressAutocomplete value={form.local_origem} onChange={(v) => setForm({ ...form, local_origem: v })} placeholder="Endereço de origem" />
              </div>
              <div className="space-y-1">
                <Label>Local de Destino</Label>
                <AddressAutocomplete value={form.local_destino} onChange={(v) => setForm({ ...form, local_destino: v })} placeholder="Endereço de destino" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea placeholder="Informações adicionais..." value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Criar Agendamento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Motorista" value={selected.motorista_nome} />
              <Detail label="Telefone" value={selected.motorista_telefone} />
              {selected.motorista_email && <Detail label="E-mail" value={selected.motorista_email} />}
              <Detail label="Tipo" value={tipoOptions.find((t) => t.value === selected.tipo_servico)?.label ?? selected.tipo_servico} />
              <Detail label="Data" value={format(parseISO(selected.data_servico), "dd/MM/yyyy")} />
              <Detail label="Horário" value={selected.horario} />
              <Detail label="Status" value={statusMap[selected.status]?.label ?? selected.status} />
              {selected.local_origem && <Detail label="Origem" value={selected.local_origem} />}
              {selected.local_destino && <Detail label="Destino" value={selected.local_destino} />}
              {selected.observacoes && <Detail label="Observações" value={selected.observacoes} />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
