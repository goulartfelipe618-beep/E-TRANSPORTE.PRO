import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, CheckCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MasterComunicarDialog from "@/components/MasterComunicarDialog";

interface SolicitacaoComunicador {
  id: string;
  tenant_id: string | null;
  user_id: string;
  nome_projeto: string;
  telefone_whatsapp: string;
  instance_name: string | null;
  status: string;
  created_at: string;
  tenant_name?: string;
}

export default function MasterComunicadorRequests() {
  const [items, setItems] = useState<SolicitacaoComunicador[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [comunicarOpen, setComunicarOpen] = useState(false);
  const [comunicarPayload, setComunicarPayload] = useState<Record<string, unknown>>({});

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("solicitacoes_comunicador")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Get tenant names
      const tenantIds = [...new Set(data.map((d: any) => d.tenant_id).filter(Boolean))];
      let tenantMap: Record<string, string> = {};
      if (tenantIds.length) {
        const { data: tenants } = await supabase.from("tenants").select("id, nome").in("id", tenantIds);
        tenants?.forEach((t: any) => { tenantMap[t.id] = t.nome; });
      }
      setItems(data.map((d: any) => ({ ...d, tenant_name: d.tenant_id ? tenantMap[d.tenant_id] || "—" : "—" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleConcluir = async (item: SolicitacaoComunicador) => {
    const { error } = await supabase
      .from("solicitacoes_comunicador")
      .update({ status: "concluido" })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Erro ao concluir", variant: "destructive" });
    } else {
      toast({ title: "Comunicador concluído com sucesso!" });
      fetchData();
    }
  };

  const statusVariant = (s: string) => {
    if (s === "pendente") return "outline" as const;
    if (s === "concluido") return "default" as const;
    return "secondary" as const;
  };

  const statusLabel = (s: string) => {
    if (s === "pendente") return "Pendente";
    if (s === "concluido") return "Concluído";
    return s;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitações de Comunicadores</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de conexão WhatsApp dos tenants.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhuma solicitação recebida.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Instância</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(item.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="font-medium">{item.nome_projeto || "—"}</TableCell>
                    <TableCell>{item.telefone_whatsapp || "—"}</TableCell>
                    <TableCell>{item.tenant_name}</TableCell>
                    <TableCell className="font-mono text-xs">{item.instance_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => {
                        setComunicarPayload({
                          nome_projeto: item.nome_projeto, telefone_whatsapp: item.telefone_whatsapp,
                          tenant: item.tenant_name, instance_name: item.instance_name,
                          status: statusLabel(item.status),
                        });
                        setComunicarOpen(true);
                      }}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {item.status === "pendente" && (
                        <Button size="sm" onClick={() => handleConcluir(item)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MasterComunicarDialog
        open={comunicarOpen}
        onClose={() => setComunicarOpen(false)}
        payload={comunicarPayload}
        titulo="Comunicar sobre Solicitação de Comunicador"
      />
    </div>
  );
}
