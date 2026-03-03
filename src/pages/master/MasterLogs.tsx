import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ScrollText, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  id: string;
  user_email: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  tenant_id: string | null;
}

interface Tenant { id: string; nome: string; }

export default function MasterLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTenant, setFilterTenant] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (filterTenant !== "all") query = query.eq("tenant_id", filterTenant);
    const { data } = await query;
    if (data) setLogs(data as LogEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    supabase.from("tenants").select("id, nome").order("nome").then(({ data }) => {
      if (data) setTenants(data as Tenant[]);
    });
  }, []);

  useEffect(() => { fetchLogs(); }, [filterTenant]);

  const filteredLogs = filterSearch
    ? logs.filter(l => 
        l.action.toLowerCase().includes(filterSearch.toLowerCase()) ||
        (l.user_email || "").toLowerCase().includes(filterSearch.toLowerCase())
      )
    : logs;

  const tenantMap: Record<string, string> = {};
  tenants.forEach(t => { tenantMap[t.id] = t.nome; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs do Sistema</h1>
          <p className="text-muted-foreground">Registro de todas as atividades.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchLogs}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por ação ou e-mail..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
        <Select value={filterTenant} onValueChange={setFilterTenant}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tenants</SelectItem>
            {tenants.map(t => (<SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum log encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm">{l.user_email || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                    <TableCell className="text-sm">{l.tenant_id ? tenantMap[l.tenant_id] || "—" : "Global"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(l.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
