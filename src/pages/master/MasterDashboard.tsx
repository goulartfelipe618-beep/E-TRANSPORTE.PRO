import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, Layers3, ScrollText, Car, UserPlus, UsersRound, Search, Filter, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import MasterComunicarDialog from "@/components/MasterComunicarDialog";

type TransferRow = Tables<"solicitacoes_transfer">;
type MotoristaRow = Tables<"solicitacoes_motorista">;
type GrupoRow = Tables<"solicitacoes_grupos">;

interface UnifiedSolicitation {
  id: string;
  tipo: "transfer" | "motorista" | "grupo";
  nome: string;
  status: string;
  tenant_id: string | null;
  tenant_nome?: string;
  created_at: string;
  detalhes: string;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pendente: "outline",
  convertida: "default",
  aprovada: "default",
  rejeitada: "destructive",
  cancelada: "destructive",
};

const tipoLabels: Record<string, string> = {
  transfer: "Transfer",
  motorista: "Motorista",
  grupo: "Grupo",
};

const tipoIcons: Record<string, typeof Car> = {
  transfer: Car,
  motorista: UserPlus,
  grupo: UsersRound,
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function MasterDashboard() {
  const [stats, setStats] = useState({ tenants: 0, users: 0, categories: 0, logsToday: 0 });
  const [solicitations, setSolicitations] = useState<UnifiedSolicitation[]>([]);
  const [tenants, setTenants] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterTenant, setFilterTenant] = useState<string>("todos");
  const [filterPeriodo, setFilterPeriodo] = useState<string>("todos");
  const [comunicarOpen, setComunicarOpen] = useState(false);
  const [comunicarPayload, setComunicarPayload] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // Stats
      const [t, u, c, l] = await Promise.all([
        supabase.from("tenants").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }),
        supabase.from("automation_categories").select("id", { count: "exact", head: true }),
        supabase.from("system_logs").select("id", { count: "exact", head: true })
          .gte("created_at", new Date().toISOString().split("T")[0]),
      ]);
      setStats({
        tenants: t.count ?? 0,
        users: u.count ?? 0,
        categories: c.count ?? 0,
        logsToday: l.count ?? 0,
      });

      // Tenants map
      const { data: tenantList } = await supabase.from("tenants").select("id, nome");
      const tMap: Record<string, string> = {};
      tenantList?.forEach((tn) => { tMap[tn.id] = tn.nome; });
      setTenants(tMap);

      // All solicitations
      const [transfers, motoristas, grupos] = await Promise.all([
        supabase.from("solicitacoes_transfer").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("solicitacoes_motorista").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("solicitacoes_grupos").select("*").order("created_at", { ascending: false }).limit(500),
      ]);

      const unified: UnifiedSolicitation[] = [];

      (transfers.data ?? []).forEach((r: TransferRow) => {
        unified.push({
          id: r.id,
          tipo: "transfer",
          nome: r.cliente_nome || "Sem nome",
          status: r.status,
          tenant_id: r.tenant_id,
          tenant_nome: r.tenant_id ? tMap[r.tenant_id] : "—",
          created_at: r.created_at,
          detalhes: `${r.tipo_viagem} | ${r.ida_embarque || ""} → ${r.ida_destino || ""}`,
        });
      });

      (motoristas.data ?? []).forEach((r: MotoristaRow) => {
        unified.push({
          id: r.id,
          tipo: "motorista",
          nome: r.nome_completo,
          status: r.status,
          tenant_id: r.tenant_id,
          tenant_nome: r.tenant_id ? tMap[r.tenant_id] : "—",
          created_at: r.created_at,
          detalhes: `${r.cidade || ""} - ${r.estado || ""} | CNH: ${r.cnh_categoria || "N/I"}`,
        });
      });

      (grupos.data ?? []).forEach((r: GrupoRow) => {
        unified.push({
          id: r.id,
          tipo: "grupo",
          nome: r.cliente_nome || "Sem nome",
          status: r.status,
          tenant_id: r.tenant_id,
          tenant_nome: r.tenant_id ? tMap[r.tenant_id] : "—",
          created_at: r.created_at,
          detalhes: `${r.destino || ""} | ${r.numero_passageiros || 0} pax`,
        });
      });

      unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSolicitations(unified);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Derived unique statuses
  const allStatuses = useMemo(() => {
    const s = new Set(solicitations.map((x) => x.status));
    return Array.from(s).sort();
  }, [solicitations]);

  // Period filter helper
  const getPeriodStart = (period: string): Date | null => {
    const now = new Date();
    switch (period) {
      case "hoje": return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "7dias": { const d = new Date(); d.setDate(d.getDate() - 7); return d; }
      case "30dias": { const d = new Date(); d.setDate(d.getDate() - 30); return d; }
      case "90dias": { const d = new Date(); d.setDate(d.getDate() - 90); return d; }
      default: return null;
    }
  };

  const filtered = useMemo(() => {
    let list = solicitations;
    if (filterTipo !== "todos") list = list.filter((x) => x.tipo === filterTipo);
    if (filterStatus !== "todos") list = list.filter((x) => x.status === filterStatus);
    if (filterTenant !== "todos") list = list.filter((x) => x.tenant_id === filterTenant);
    const periodStart = getPeriodStart(filterPeriodo);
    if (periodStart) list = list.filter((x) => new Date(x.created_at) >= periodStart);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((x) =>
        x.nome.toLowerCase().includes(term) ||
        x.detalhes.toLowerCase().includes(term) ||
        x.tenant_nome?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [solicitations, filterTipo, filterStatus, filterTenant, filterPeriodo, searchTerm]);

  // Counts per tipo
  const countByTipo = useMemo(() => {
    const map = { transfer: 0, motorista: 0, grupo: 0 };
    filtered.forEach((x) => { map[x.tipo]++; });
    return map;
  }, [filtered]);

  const statCards = [
    { label: "Tenants", value: stats.tenants, icon: Building2, color: "text-blue-500" },
    { label: "Usuários", value: stats.users, icon: Users, color: "text-emerald-500" },
    { label: "Categorias", value: stats.categories, icon: Layers3, color: "text-amber-500" },
    { label: "Logs Hoje", value: stats.logsToday, icon: ScrollText, color: "text-purple-500" },
  ];

  const solCards = [
    { label: "Transfer", value: countByTipo.transfer, icon: Car, color: "text-sky-500" },
    { label: "Motoristas", value: countByTipo.motorista, icon: UserPlus, color: "text-orange-500" },
    { label: "Grupos", value: countByTipo.grupo, icon: UsersRound, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel Master</h1>
        <p className="text-muted-foreground">Visão geral do sistema white-label.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={cn("h-5 w-5", c.color)} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Solicitations section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Filter className="h-5 w-5" /> Solicitações de todos os Tenants
        </h2>

        {/* Solicitation count cards */}
        <div className="grid grid-cols-3 gap-4">
          {solCards.map((c) => (
            <Card key={c.label} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className={cn("h-5 w-5", c.color)} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome, detalhes, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="motorista">Motorista</SelectItem>
              <SelectItem value="grupo">Grupo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              {allStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTenant} onValueChange={setFilterTenant}>
            <SelectTrigger><SelectValue placeholder="Tenant" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tenants</SelectItem>
              {Object.entries(tenants).map(([id, nome]) => (
                <SelectItem key={id} value={id}>{nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
            <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo Período</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="90dias">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhuma solicitação encontrada.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 100).map((s) => {
                    const Icon = tipoIcons[s.tipo];
                    return (
                      <TableRow key={`${s.tipo}-${s.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary" className="text-xs">{tipoLabels[s.tipo]}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{s.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{s.tenant_nome || "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{s.detalhes}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[s.status] || "secondary"}>
                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {filtered.length > 100 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Exibindo 100 de {filtered.length} resultados. Use os filtros para refinar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
