import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, Search, Truck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useTenantId from "@/hooks/useTenantId";

interface UnifiedVehicle {
  id: string;
  origem: "motorista" | "parceiro";
  proprietario_nome: string;
  proprietario_cidade?: string | null;
  proprietario_estado?: string | null;
  marca: string;
  modelo: string;
  placa: string;
  ano: number | null;
  cor: string | null;
  combustivel: string | null;
  status: string;
}

const statusColor: Record<string, string> = {
  ativo: "default",
  inativo: "secondary",
  manutencao: "destructive",
};

export default function Veiculos() {
  const tenantId = useTenantId();
  const [vehicles, setVehicles] = useState<UnifiedVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterOrigem, setFilterOrigem] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterMarca, setFilterMarca] = useState("todos");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const unified: UnifiedVehicle[] = [];

      // Motorista vehicles
      const { data: mv } = await supabase
        .from("motorista_veiculos")
        .select("*, motoristas(nome_completo, cidade, estado)");

      (mv ?? []).forEach((v: any) => {
        unified.push({
          id: v.id,
          origem: "motorista",
          proprietario_nome: v.motoristas?.nome_completo || "—",
          proprietario_cidade: v.motoristas?.cidade,
          proprietario_estado: v.motoristas?.estado,
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa,
          ano: v.ano,
          cor: v.cor,
          combustivel: v.combustivel,
          status: v.status,
        });
      });

      // Parceiro vehicles
      const { data: pv } = await supabase
        .from("parceiro_veiculos")
        .select("*, parceiros(razao_social, cidade, estado)");

      (pv ?? []).forEach((v: any) => {
        unified.push({
          id: v.id,
          origem: "parceiro",
          proprietario_nome: v.parceiros?.razao_social || "—",
          proprietario_cidade: v.parceiros?.cidade,
          proprietario_estado: v.parceiros?.estado,
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa,
          ano: v.ano,
          cor: v.cor,
          combustivel: v.combustivel,
          status: v.status,
        });
      });

      unified.sort((a, b) => a.proprietario_nome.localeCompare(b.proprietario_nome));
      setVehicles(unified);
      setLoading(false);
    };
    fetch();
  }, [tenantId]);

  const allMarcas = useMemo(() => {
    const s = new Set(vehicles.map((v) => v.marca));
    return Array.from(s).sort();
  }, [vehicles]);

  const filtered = useMemo(() => {
    let list = vehicles;
    if (filterOrigem !== "todos") list = list.filter((v) => v.origem === filterOrigem);
    if (filterStatus !== "todos") list = list.filter((v) => v.status === filterStatus);
    if (filterMarca !== "todos") list = list.filter((v) => v.marca === filterMarca);
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.proprietario_nome.toLowerCase().includes(t) ||
          v.modelo.toLowerCase().includes(t) ||
          v.placa.toLowerCase().includes(t) ||
          v.marca.toLowerCase().includes(t) ||
          (v.proprietario_cidade || "").toLowerCase().includes(t)
      );
    }
    return list;
  }, [vehicles, filterOrigem, filterStatus, filterMarca, search]);

  const countMotorista = filtered.filter((v) => v.origem === "motorista").length;
  const countParceiro = filtered.filter((v) => v.origem === "parceiro").length;
  const countAtivo = filtered.filter((v) => v.status === "ativo").length;

  const statCards = [
    { label: "Total de Veículos", value: filtered.length, icon: Car, color: "text-primary" },
    { label: "Motoristas", value: countMotorista, icon: Users, color: "text-sky-500" },
    { label: "Parceiros", value: countParceiro, icon: Truck, color: "text-orange-500" },
    { label: "Ativos", value: countAtivo, icon: Car, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
        <p className="text-muted-foreground">
          Consulta unificada da frota de motoristas e parceiros
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar placa, modelo, proprietário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterOrigem} onValueChange={setFilterOrigem}>
          <SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Origens</SelectItem>
            <SelectItem value="motorista">Motoristas</SelectItem>
            <SelectItem value="parceiro">Parceiros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMarca} onValueChange={setFilterMarca}>
          <SelectTrigger><SelectValue placeholder="Marca" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Marcas</SelectItem>
            {allMarcas.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhum veículo encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map((v) => (
                  <TableRow key={`${v.origem}-${v.id}`}>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {v.origem === "motorista" ? "Motorista" : "Parceiro"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{v.proprietario_nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[v.proprietario_cidade, v.proprietario_estado].filter(Boolean).join(" - ") || "—"}
                    </TableCell>
                    <TableCell>{v.marca} {v.modelo}</TableCell>
                    <TableCell className="font-mono">{v.placa}</TableCell>
                    <TableCell>{v.ano || "—"}</TableCell>
                    <TableCell>{v.cor || "—"}</TableCell>
                    <TableCell>{v.combustivel || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={(statusColor[v.status] as any) || "secondary"}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filtered.length > 200 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t">
              Exibindo 200 de {filtered.length} resultados. Use os filtros para refinar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
