import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  tenant_id: string | null;
  user_email?: string;
  tenant_name?: string;
}

interface Tenant {
  id: string;
  nome: string;
}

export default function MasterUsers() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("admin");
  const [tenantId, setTenantId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [rolesRes, tenantsRes] = await Promise.all([
      supabase.from("user_roles").select("*"),
      supabase.from("tenants").select("id, nome").order("nome"),
    ]);
    
    if (tenantsRes.data) setTenants(tenantsRes.data as Tenant[]);
    
    if (rolesRes.data) {
      // Fetch emails via edge function
      const userIds = rolesRes.data.map((r: any) => r.user_id);
      let emailMap: Record<string, string> = {};
      
      try {
        const { data } = await supabase.functions.invoke("manage-users", {
          body: { action: "list", user_ids: userIds },
        });
        if (data?.users) {
          data.users.forEach((u: any) => { emailMap[u.id] = u.email; });
        }
      } catch {}

      const tenantMap: Record<string, string> = {};
      if (tenantsRes.data) tenantsRes.data.forEach((t: any) => { tenantMap[t.id] = t.nome; });

      setUsers(rolesRes.data.map((r: any) => ({
        ...r,
        user_email: emailMap[r.user_id] || r.user_id,
        tenant_name: r.tenant_id ? tenantMap[r.tenant_id] || "—" : "—",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!email.trim() || !password.trim()) return;
    if (role !== "master_admin" && !tenantId) {
      toast({ title: "Selecione um tenant", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "create",
          email: email.trim(),
          password: password.trim(),
          role,
          tenant_id: role === "master_admin" ? null : tenantId,
        },
      });
      if (error || data?.error) {
        toast({ title: "Erro", description: data?.error || error?.message, variant: "destructive" });
      } else {
        toast({ title: "Usuário criado com sucesso!" });
        setDialogOpen(false);
        setEmail("");
        setPassword("");
        setRole("admin");
        setTenantId("");
        fetchData();
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (ur: UserRole) => {
    try {
      await supabase.functions.invoke("manage-users", {
        body: { action: "delete", user_id: ur.user_id },
      });
      fetchData();
      toast({ title: "Usuário excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const roleLabel = (r: string) => {
    if (r === "master_admin") return "Master Admin";
    return "Administrador";
  };

  const roleColor = (r: string) => {
    if (r === "master_admin") return "destructive" as const;
    if (r === "admin") return "default" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Crie e gerencie usuários do sistema.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.user_email}</TableCell>
                    <TableCell><Badge variant={roleColor(u.role)}>{roleLabel(u.role)}</Badge></TableCell>
                    <TableCell>{u.tenant_name}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={u.role === "master_admin"}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                            <AlertDialogDescription>O acesso será removido permanentemente.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(u)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Crie um novo acesso ao sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha de acesso" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {role !== "master_admin" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tenant</label>
                <Select value={tenantId} onValueChange={setTenantId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tenant..." /></SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tenants.length === 0 && (
                  <p className="text-xs text-muted-foreground">Crie um tenant antes de adicionar usuários.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !email.trim() || !password.trim()}>
              {saving ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
