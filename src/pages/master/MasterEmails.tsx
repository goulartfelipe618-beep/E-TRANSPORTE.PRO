import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, ExternalLink, CheckCircle2, Clock, XCircle, Link2, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MasterComunicarDialog from "@/components/MasterComunicarDialog";

interface EmailSolicitation {
  id: string;
  tenant_id: string | null;
  user_id: string;
  nome_completo: string;
  nome_empresa: string;
  dominio: string;
  email_solicitado: string;
  plano: string;
  valor: string;
  status: string;
  email_criado: string | null;
  webmail_url: string | null;
  observacoes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pendente: "bg-amber-500/15 text-amber-700 border-amber-200",
  aprovada: "bg-blue-500/15 text-blue-700 border-blue-200",
  ativo: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  rejeitada: "bg-destructive/15 text-destructive border-destructive/20",
  cancelada: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  ativo: "Ativo",
  rejeitada: "Rejeitada",
  cancelada: "Cancelada",
};

export default function MasterEmails() {
  const { toast } = useToast();
  const [solicitations, setSolicitations] = useState<EmailSolicitation[]>([]);
  const [tenants, setTenants] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmailSolicitation | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editObs, setEditObs] = useState("");
  const [saving, setSaving] = useState(false);

  // Comunicar
  const [comunicarOpen, setComunicarOpen] = useState(false);
  const [comunicarPayload, setComunicarPayload] = useState<Record<string, unknown>>({});

  const fetchData = async () => {
    setLoading(true);
    const [{ data: sols }, { data: tenantList }] = await Promise.all([
      supabase.from("solicitacoes_email").select("*").order("created_at", { ascending: false }),
      supabase.from("tenants").select("id, nome"),
    ]);
    setSolicitations((sols as EmailSolicitation[]) || []);
    const tMap: Record<string, string> = {};
    tenantList?.forEach((t) => { tMap[t.id] = t.nome; });
    setTenants(tMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (item: EmailSolicitation) => {
    setEditItem(item);
    setEditEmail(item.email_criado || "");
    setEditUrl(item.webmail_url || "");
    setEditStatus(item.status);
    setEditObs(item.observacoes || "");
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    const updates: Record<string, unknown> = {
      status: editStatus,
      observacoes: editObs || null,
      email_criado: editEmail || null,
      webmail_url: editUrl || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("solicitacoes_email").update(updates).eq("id", editItem.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo com sucesso!" });
      setEditOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const filtered = filterStatus === "todos" ? solicitations : solicitations.filter((s) => s.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de E-mail</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de e-mail profissional dos tenants.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-sm">{filtered.length} solicitações</Badge>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma solicitação encontrada.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>E-mail Solicitado</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>E-mail Criado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{s.tenant_id ? tenants[s.tenant_id] || "—" : "—"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{s.nome_completo}</TableCell>
                    <TableCell className="font-mono text-sm">{s.email_solicitado}</TableCell>
                    <TableCell>{s.plano}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[s.status] || "bg-muted"}>
                        {s.status === "ativo" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />{statusLabels[s.status]}</>
                        ) : s.status === "pendente" ? (
                          <><Clock className="h-3 w-3 mr-1" />{statusLabels[s.status]}</>
                        ) : (
                          statusLabels[s.status] || s.status
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.email_criado ? (
                        <span className="font-mono text-sm text-emerald-600">{s.email_criado}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(s)} title="Editar">
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => {
                          setComunicarPayload({
                            tipo: "E-mail", nome: s.nome_completo,
                            tenant: s.tenant_id ? tenants[s.tenant_id] : "—",
                            email: s.email_solicitado, plano: s.plano, status: s.status,
                          });
                          setComunicarOpen(true);
                        }}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Gerenciar Solicitação
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Solicitante:</span> <strong>{editItem.nome_completo}</strong></p>
                <p><span className="text-muted-foreground">Empresa:</span> {editItem.nome_empresa}</p>
                <p><span className="text-muted-foreground">E-mail solicitado:</span> <span className="font-mono">{editItem.email_solicitado}</span></p>
                <p><span className="text-muted-foreground">Plano:</span> {editItem.plano} — R$ {editItem.valor}/mês</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>E-mail Criado</Label>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="contato@empresa.com.br" />
                <p className="text-xs text-muted-foreground">Preencha após criar o e-mail no provedor.</p>
              </div>

              <div className="space-y-2">
                <Label>Link do Webmail</Label>
                <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="https://webmail.provedor.com.br" />
                <p className="text-xs text-muted-foreground">O administrador verá um botão "Acessar E-mail" com este link.</p>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={editObs} onChange={(e) => setEditObs(e.target.value)} placeholder="Notas internas..." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MasterComunicarDialog
        open={comunicarOpen}
        onClose={() => setComunicarOpen(false)}
        payload={comunicarPayload}
        titulo="Comunicar sobre E-mail"
      />
    </div>
  );
}
