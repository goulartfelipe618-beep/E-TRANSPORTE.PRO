import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Eye, StickyNote, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CORES = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#22c55e", label: "Verde" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
];

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  cor: string;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: string;
  nome: string;
}

export default function MasterAnotacoes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filterTenant, setFilterTenant] = useState<string>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Anotacao | null>(null);
  const [viewing, setViewing] = useState<Anotacao | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [cor, setCor] = useState("#3b82f6");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: notes }, { data: tenantList }] = await Promise.all([
      supabase.from("anotacoes").select("*").order("created_at", { ascending: false }),
      supabase.from("tenants").select("id, nome").order("nome"),
    ]);
    if (notes) setAnotacoes(notes as Anotacao[]);
    if (tenantList) setTenants(tenantList as Tenant[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "—";
    return tenants.find((t) => t.id === tenantId)?.nome || tenantId.slice(0, 8);
  };

  const filtered = filterTenant === "all"
    ? anotacoes
    : anotacoes.filter((a) => a.tenant_id === filterTenant);

  const handleDelete = async (id: string) => {
    await supabase.from("anotacoes").delete().eq("id", id);
    toast({ title: "Anotação removida" });
    fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anotações</h1>
          <p className="text-muted-foreground">Visualize todas as anotações dos tenants.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={filterTenant} onValueChange={setFilterTenant}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar por tenant" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tenants</SelectItem>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} anotações</Badge>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cor</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma anotação encontrada.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: a.cor }} />
                  </TableCell>
                  <TableCell className="font-medium">{a.titulo}</TableCell>
                  <TableCell className="text-muted-foreground">{getTenantName(a.tenant_id)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setViewing(a); setViewDialogOpen(true); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: viewing?.cor }} />
              {viewing?.titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {viewing?.conteudo || "Sem conteúdo."}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Tenant: {getTenantName(viewing?.tenant_id ?? null)} · {viewing && new Date(viewing.created_at).toLocaleString("pt-BR")}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
