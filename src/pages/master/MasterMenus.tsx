import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Parent menus that are always enabled (cannot be disabled)
const LOCKED_MENUS = ["dashboard", "transfer", "marketing", "grupos"];

interface MenuDef {
  key: string;
  label: string;
  parent?: string;
  locked?: boolean;
}

const ALL_MENUS: MenuDef[] = [
  // Dashboard (locked)
  { key: "dashboard", label: "Dashboard", locked: true },
  { key: "dashboard.metricas", label: "Métricas", parent: "dashboard", locked: true },
  { key: "dashboard.abrangencia", label: "Abrangência", parent: "dashboard", locked: true },
  // Transfer (locked)
  { key: "transfer", label: "Transfer", locked: true },
  { key: "transfer.solicitacoes", label: "Solicitações", parent: "transfer", locked: true },
  { key: "transfer.reservas", label: "Reservas", parent: "transfer", locked: true },
  { key: "transfer.contrato", label: "Contrato", parent: "transfer", locked: true },
  { key: "transfer.geolocalizacao", label: "Geolocalização", parent: "transfer", locked: true },
  // Grupos (locked)
  { key: "grupos", label: "Grupos", locked: true },
  { key: "grupos.solicitacoes", label: "Solicitações", parent: "grupos", locked: true },
  { key: "grupos.reservas", label: "Reservas", parent: "grupos", locked: true },
  { key: "grupos.contrato", label: "Contrato", parent: "grupos", locked: true },
  // Motoristas
  { key: "motoristas", label: "Motoristas" },
  { key: "motoristas.cadastros", label: "Cadastros", parent: "motoristas" },
  { key: "motoristas.parcerias", label: "Parcerias", parent: "motoristas" },
  { key: "motoristas.solicitacoes", label: "Solicitações", parent: "motoristas" },
  { key: "motoristas.agendamentos", label: "Agendamentos", parent: "motoristas" },
  // Veículos
  { key: "veiculos", label: "Veículos" },
  // Taxi
  { key: "taxi", label: "Taxi" },
  { key: "taxi.solicitacoes", label: "Solicitações", parent: "taxi" },
  // Campanhas
  { key: "campanhas", label: "Campanhas" },
  { key: "campanhas.ativos", label: "Ativos", parent: "campanhas" },
  { key: "campanhas.leads", label: "Leads", parent: "campanhas" },
  // Marketing (locked)
  { key: "marketing", label: "Marketing", locked: true },
  { key: "marketing.receptivos", label: "Receptivos", parent: "marketing", locked: true },
  { key: "marketing.qrcode", label: "QR Code", parent: "marketing", locked: true },
  // Network
  { key: "network", label: "Network" },
  // Google
  { key: "google", label: "Google Business" },
  // E-mail Business
  { key: "email-business", label: "E-mail Business" },
  // Website
  { key: "website", label: "Website" },
  // Domínios
  { key: "dominios", label: "Domínios" },
  // Sistema
  { key: "sistema", label: "Sistema" },
  { key: "sistema.configuracoes", label: "Configurações", parent: "sistema" },
  { key: "sistema.automacoes", label: "Automações", parent: "sistema" },
  { key: "sistema.comunicador", label: "Comunicador", parent: "sistema" },
  { key: "sistema.usuarios", label: "Usuários", parent: "sistema" },
  { key: "sistema.logs", label: "Logs", parent: "sistema" },
  { key: "sistema.aplicativo", label: "Aplicativo", parent: "sistema" },
  { key: "sistema.tickets", label: "Tickets", parent: "sistema" },
  // Anotações
  { key: "anotacoes", label: "Anotações" },
];

interface Tenant { id: string; nome: string; }

export default function MasterMenus() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [menuState, setMenuState] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("tenants").select("id, nome").order("nome").then(({ data }) => {
      if (data) setTenants(data as Tenant[]);
    });
  }, []);

  useEffect(() => {
    if (!selectedTenant) return;
    setLoading(true);
    supabase.from("tenant_menu_config").select("menu_key, enabled").eq("tenant_id", selectedTenant).then(({ data }) => {
      const state: Record<string, boolean> = {};
      ALL_MENUS.forEach(m => { state[m.key] = true; }); // default all enabled
      if (data) data.forEach((d: any) => { state[d.menu_key] = d.enabled; });
      setMenuState(state);
      setLoading(false);
    });
  }, [selectedTenant]);

  const handleSave = async () => {
    if (!selectedTenant) return;
    setSaving(true);
    // Delete existing
    await supabase.from("tenant_menu_config").delete().eq("tenant_id", selectedTenant);
    // Insert all
    const rows = Object.entries(menuState).map(([menu_key, enabled]) => ({
      tenant_id: selectedTenant,
      menu_key,
      enabled,
    }));
    const { error } = await supabase.from("tenant_menu_config").insert(rows);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Permissões salvas!" });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menus & Permissões</h1>
        <p className="text-muted-foreground">Configure quais menus cada tenant pode acessar.</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedTenant} onValueChange={setSelectedTenant}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Selecione um tenant..." /></SelectTrigger>
          <SelectContent>
            {tenants.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>))}
          </SelectContent>
        </Select>
        {selectedTenant && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Permissões"}
          </Button>
        )}
      </div>

      {selectedTenant && !loading && (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Menus disponíveis</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ALL_MENUS.map((m) => {
                const isChild = !!m.parent;
                const isLocked = !!m.locked;
                // If parent is disabled, child is also disabled
                const parentDisabled = isChild && !(menuState[m.parent!] ?? true);
                const checked = parentDisabled ? false : (menuState[m.key] ?? true);

                return (
                  <div key={m.key} className="flex items-center justify-between py-1">
                    <span className={`text-sm ${isChild ? "pl-6 text-muted-foreground" : "font-medium text-foreground"}`}>
                      {isChild ? `↳ ${m.label}` : m.label}
                      {isLocked && (
                        <span className="ml-2 text-xs text-muted-foreground/60">(padrão)</span>
                      )}
                    </span>
                    <Switch
                      checked={checked}
                      disabled={isLocked || parentDisabled}
                      onCheckedChange={(v) => {
                        const updates: Record<string, boolean> = { [m.key]: v };
                        // If disabling a parent, disable all children
                        if (!isChild && !v) {
                          ALL_MENUS.forEach((child) => {
                            if (child.parent === m.key) {
                              updates[child.key] = false;
                            }
                          });
                        }
                        // If enabling a parent, enable all children
                        if (!isChild && v) {
                          ALL_MENUS.forEach((child) => {
                            if (child.parent === m.key) {
                              updates[child.key] = true;
                            }
                          });
                        }
                        setMenuState((prev) => ({ ...prev, ...updates }));
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTenant && loading && <p className="text-muted-foreground text-sm">Carregando...</p>}
      {!selectedTenant && tenants.length > 0 && <p className="text-muted-foreground text-sm">Selecione um tenant para configurar.</p>}
      {tenants.length === 0 && <p className="text-muted-foreground text-sm">Crie um tenant primeiro.</p>}
    </div>
  );
}
