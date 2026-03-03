import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Building2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface LocationCount {
  name: string;
  count: number;
}

export default function DashboardAbrangencia() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [reservasTransfer, setReservasTransfer] = useState<any[]>([]);
  const [reservasGrupos, setReservasGrupos] = useState<any[]>([]);
  const [motoristas, setMotoristas] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      setLoading(true);
      const [rt, rg, mc] = await Promise.all([
        supabase.from("reservas_transfer").select("ida_embarque, ida_destino, volta_embarque, volta_destino, por_hora_endereco_inicio, cliente_origem").eq("tenant_id", tenantId),
        supabase.from("reservas_grupos").select("endereco_embarque, destino, cliente_origem").eq("tenant_id", tenantId),
        supabase.from("motoristas").select("cidade, estado").eq("tenant_id", tenantId),
      ]);
      setReservasTransfer(rt.data ?? []);
      setReservasGrupos(rg.data ?? []);
      setMotoristas(mc.data ?? []);
      setLoading(false);
    };
    load();
  }, [tenantId]);

  // Extract unique locations from all data
  const extractCity = (address: string | null): string | null => {
    if (!address) return null;
    // Try to extract city from address patterns like "..., City - ST" or "..., City"
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      const cityPart = parts[parts.length - 2] || parts[parts.length - 1];
      return cityPart.replace(/\s*-\s*\w{2}$/, "").trim();
    }
    return address.trim();
  };

  const destinations = useMemo(() => {
    const map: Record<string, number> = {};
    const addLoc = (loc: string | null) => {
      if (!loc || loc.trim().length < 3) return;
      const city = extractCity(loc) || loc;
      const key = city.substring(0, 30);
      map[key] = (map[key] || 0) + 1;
    };

    reservasTransfer.forEach((r) => {
      addLoc(r.ida_destino);
      addLoc(r.volta_destino);
    });
    reservasGrupos.forEach((r) => {
      addLoc(r.destino);
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [reservasTransfer, reservasGrupos]);

  const origins = useMemo(() => {
    const map: Record<string, number> = {};
    const addLoc = (loc: string | null) => {
      if (!loc || loc.trim().length < 3) return;
      const city = extractCity(loc) || loc;
      const key = city.substring(0, 30);
      map[key] = (map[key] || 0) + 1;
    };

    reservasTransfer.forEach((r) => {
      addLoc(r.ida_embarque);
      addLoc(r.volta_embarque);
      addLoc(r.por_hora_endereco_inicio);
    });
    reservasGrupos.forEach((r) => {
      addLoc(r.endereco_embarque);
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [reservasTransfer, reservasGrupos]);

  const clientOrigins = useMemo(() => {
    const map: Record<string, number> = {};
    [...reservasTransfer, ...reservasGrupos].forEach((r) => {
      const o = r.cliente_origem;
      if (o && o.trim().length > 1) {
        map[o] = (map[o] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [reservasTransfer, reservasGrupos]);

  const motoristaCities = useMemo(() => {
    const map: Record<string, number> = {};
    motoristas.forEach((m) => {
      const city = m.cidade;
      if (city && city.trim().length > 1) {
        const key = `${city}${m.estado ? ` - ${m.estado}` : ""}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [motoristas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const totalLocations = new Set([
    ...destinations.map((d) => d.name),
    ...origins.map((o) => o.name),
  ]).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abrangência</h1>
        <p className="text-muted-foreground">Cobertura geográfica das operações</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Localidades Atendidas</p>
                <p className="text-2xl font-bold">{totalLocations}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cidades de Motoristas</p>
                <p className="text-2xl font-bold">{motoristaCities.length}</p>
              </div>
              <Navigation className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Origens de Clientes</p>
                <p className="text-2xl font-bold">{clientOrigins.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold">{reservasTransfer.length + reservasGrupos.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Principais Destinos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {destinations.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={destinations} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={120} className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" name="Viagens" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sem dados de destinos ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Top Origins */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4" /> Principais Origens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {origins.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={origins} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={120} className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" name="Embarques" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sem dados de origens ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Origins */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Origem dos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientOrigins.length > 0 ? (
              <div className="space-y-2">
                {clientOrigins.map((o) => (
                  <div key={o.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm">{o.name}</span>
                    <Badge variant="secondary">{o.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem dados de origem de clientes</p>
            )}
          </CardContent>
        </Card>

        {/* Driver Cities */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4" /> Cidades dos Motoristas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {motoristaCities.length > 0 ? (
              <div className="space-y-2">
                {motoristaCities.map((c) => (
                  <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm">{c.name}</span>
                    <Badge variant="secondary">{c.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem motoristas cadastrados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
