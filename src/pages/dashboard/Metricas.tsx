import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, ArrowRightLeft, Users, Bus, TrendingUp, TrendingDown,
  Clock, CheckCircle2, XCircle, AlertCircle, Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

interface KPI {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "hsl(var(--chart-4))",
  confirmada: "hsl(var(--chart-2))",
  cancelada: "hsl(var(--chart-1))",
  concluida: "hsl(var(--chart-3))",
  aprovado: "hsl(var(--chart-2))",
  rejeitado: "hsl(var(--chart-1))",
  ativo: "hsl(var(--chart-5))",
};

export default function DashboardMetricas() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState<any[]>([]);
  const [gruposData, setGruposData] = useState<any[]>([]);
  const [motoristasData, setMotoristasData] = useState<any[]>([]);
  const [reservasTransfer, setReservasTransfer] = useState<any[]>([]);
  const [reservasGrupos, setReservasGrupos] = useState<any[]>([]);
  const [motoristasCad, setMotoristasCad] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      setLoading(true);
      const [st, sg, sm, rt, rg, mc] = await Promise.all([
        supabase.from("solicitacoes_transfer").select("*").eq("tenant_id", tenantId),
        supabase.from("solicitacoes_grupos").select("*").eq("tenant_id", tenantId),
        supabase.from("solicitacoes_motorista").select("*").eq("tenant_id", tenantId),
        supabase.from("reservas_transfer").select("*").eq("tenant_id", tenantId),
        supabase.from("reservas_grupos").select("*").eq("tenant_id", tenantId),
        supabase.from("motoristas").select("*").eq("tenant_id", tenantId),
      ]);
      setTransferData(st.data ?? []);
      setGruposData(sg.data ?? []);
      setMotoristasData(sm.data ?? []);
      setReservasTransfer(rt.data ?? []);
      setReservasGrupos(rg.data ?? []);
      setMotoristasCad(mc.data ?? []);
      setLoading(false);
    };
    load();
  }, [tenantId]);

  const countByStatus = (data: any[]) => {
    const map: Record<string, number> = {};
    data.forEach((d) => {
      const s = d.status || "desconhecido";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const isThisMonth = (d: string) => {
    const dt = new Date(d);
    return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
  };

  const transferThisMonth = transferData.filter((d) => isThisMonth(d.created_at));
  const gruposThisMonth = gruposData.filter((d) => isThisMonth(d.created_at));
  const motoristasThisMonth = motoristasData.filter((d) => isThisMonth(d.created_at));

  const totalSolicitacoes = transferData.length + gruposData.length + motoristasData.length;
  const totalReservas = reservasTransfer.length + reservasGrupos.length;
  const pendentes = [...transferData, ...gruposData, ...motoristasData].filter((d) => d.status === "pendente").length;

  const valorTotal = [...reservasTransfer, ...reservasGrupos].reduce(
    (acc, r) => acc + (Number(r.valor_total) || 0), 0
  );

  const kpis: KPI[] = [
    { label: "Total Solicitações", value: totalSolicitacoes, icon: Activity, color: "text-blue-500" },
    { label: "Reservas Ativas", value: totalReservas, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Pendentes", value: pendentes, icon: Clock, color: "text-amber-500" },
    { label: "Faturamento", value: valorTotal, icon: TrendingUp, color: "text-green-500" },
  ];

  // Monthly trend (last 6 months)
  const monthlyTrend = () => {
    const months: { month: string; transfer: number; grupos: number; motoristas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = d.toLocaleDateString("pt-BR", { month: "short" });
      months.push({
        month: label,
        transfer: transferData.filter((x) => { const dt = new Date(x.created_at); return dt.getMonth() === m && dt.getFullYear() === y; }).length,
        grupos: gruposData.filter((x) => { const dt = new Date(x.created_at); return dt.getMonth() === m && dt.getFullYear() === y; }).length,
        motoristas: motoristasData.filter((x) => { const dt = new Date(x.created_at); return dt.getMonth() === m && dt.getFullYear() === y; }).length,
      });
    }
    return months;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Métricas</h1>
        <p className="text-muted-foreground">Indicadores de performance e KPIs do seu negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {kpi.label === "Faturamento" ? formatCurrency(kpi.value) : kpi.value}
                  </p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTrend()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Bar dataKey="transfer" name="Transfer" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="grupos" name="Grupos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="motoristas" name="Motoristas" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution - Transfer */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Status das Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={countByStatus([...transferData, ...gruposData, ...motoristasData])}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {countByStatus([...transferData, ...gruposData, ...motoristasData]).map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || `hsl(var(--chart-${(i % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-blue-500" /> Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Solicitações</span><span className="font-semibold">{transferData.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reservas</span><span className="font-semibold">{reservasTransfer.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Este mês</span><span className="font-semibold">{transferThisMonth.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="font-semibold text-green-600">{formatCurrency(reservasTransfer.reduce((a: number, r: any) => a + (Number(r.valor_total) || 0), 0))}</span></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bus className="h-4 w-4 text-purple-500" /> Grupos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Solicitações</span><span className="font-semibold">{gruposData.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reservas</span><span className="font-semibold">{reservasGrupos.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Este mês</span><span className="font-semibold">{gruposThisMonth.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="font-semibold text-green-600">{formatCurrency(reservasGrupos.reduce((a: number, r: any) => a + (Number(r.valor_total) || 0), 0))}</span></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" /> Motoristas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Candidaturas</span><span className="font-semibold">{motoristasData.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cadastrados</span><span className="font-semibold">{motoristasCad.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Este mês</span><span className="font-semibold">{motoristasThisMonth.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ativos</span><span className="font-semibold text-emerald-600">{motoristasCad.filter((m) => m.status === "ativo").length}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
