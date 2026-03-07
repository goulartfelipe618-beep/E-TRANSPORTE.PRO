import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Search, Eye, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DomainRequest {
  id: string;
  dominio: string;
  plano: string;
  valor: number;
  cpf: string;
  nome_completo: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  uf: string;
  cidade: string;
  ddd: string;
  telefone: string;
  ramal: string | null;
  status: string;
  created_at: string;
  tenant_id: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  em_analise: { label: "Em Análise", color: "bg-amber-500" },
  aprovado: { label: "Aprovado", color: "bg-emerald-600" },
  rejeitado: { label: "Rejeitado", color: "bg-destructive" },
  registrado: { label: "Registrado", color: "bg-primary" },
};

export default function MasterDominios() {
  const [requests, setRequests] = useState<DomainRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selected, setSelected] = useState<DomainRequest | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("solicitacoes_dominio" as any).select("*").order("created_at", { ascending: false });
    if (!error && data) setRequests(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase.from("solicitacoes_dominio" as any).update({ status } as any).eq("id", id);
    if (error) { toast.error("Erro ao atualizar."); } else {
      toast.success(`Status alterado para ${STATUS_MAP[status]?.label || status}`);
      fetchRequests();
      setSelected(null);
    }
    setUpdating(false);
  };

  const filtered = requests.filter((r) => {
    const matchSearch = !search || r.dominio.includes(search.toLowerCase()) || r.nome_completo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sol. Domínio</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de registro de domínios.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Solicitações ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por domínio ou nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
                <SelectItem value="registrado">Registrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma solicitação encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const st = STATUS_MAP[r.status] || { label: r.status, color: "bg-muted" };
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono font-medium">{r.dominio}</TableCell>
                        <TableCell>{r.nome_completo}</TableCell>
                        <TableCell>{r.plano}</TableCell>
                        <TableCell>R$ {Number(r.valor).toFixed(2).replace(".", ",")}</TableCell>
                        <TableCell><Badge className={`${st.color} text-white`}>{st.label}</Badge></TableCell>
                        <TableCell>{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {selected?.dominio}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Nome:</span><span className="text-foreground">{selected.nome_completo}</span>
                <span className="text-muted-foreground">CPF:</span><span className="text-foreground">{selected.cpf}</span>
                <span className="text-muted-foreground">E-mail:</span><span className="text-foreground">{selected.email}</span>
                <span className="text-muted-foreground">Telefone:</span><span className="text-foreground">({selected.ddd}) {selected.telefone}</span>
                <span className="text-muted-foreground">Endereço:</span><span className="text-foreground">{selected.endereco}, {selected.numero} {selected.complemento || ""}</span>
                <span className="text-muted-foreground">Cidade/UF:</span><span className="text-foreground">{selected.cidade}/{selected.uf}</span>
                <span className="text-muted-foreground">CEP:</span><span className="text-foreground">{selected.cep}</span>
                <span className="text-muted-foreground">Plano:</span><span className="text-foreground">{selected.plano}</span>
                <span className="text-muted-foreground">Valor:</span><span className="text-foreground font-medium">R$ {Number(selected.valor).toFixed(2).replace(".", ",")}</span>
                {selected.ramal && <><span className="text-muted-foreground">Ramal:</span><span className="text-foreground">{selected.ramal}</span></>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 gap-2 text-emerald-600 border-emerald-600/30 hover:bg-emerald-50" disabled={updating} onClick={() => updateStatus(selected.id, "aprovado")}>
                  <CheckCircle className="h-4 w-4" /> Aprovar
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5" disabled={updating} onClick={() => updateStatus(selected.id, "rejeitado")}>
                  <XCircle className="h-4 w-4" /> Rejeitar
                </Button>
                <Button variant="outline" className="flex-1 gap-2" disabled={updating} onClick={() => updateStatus(selected.id, "registrado")}>
                  <Globe className="h-4 w-4" /> Registrado
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
