import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ALL_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "dashboard.metricas", label: "  ↳ Métricas" },
  { key: "dashboard.abrangencia", label: "  ↳ Abrangência" },
  { key: "transfer", label: "Transfer" },
  { key: "transfer.solicitacoes", label: "  ↳ Solicitações" },
  { key: "transfer.reservas", label: "  ↳ Reservas" },
  { key: "transfer.contrato", label: "  ↳ Contrato" },
  { key: "transfer.geolocalizacao", label: "  ↳ Geolocalização" },
  { key: "grupos", label: "Grupos" },
  { key: "grupos.solicitacoes", label: "  ↳ Solicitações" },
  { key: "grupos.reservas", label: "  ↳ Reservas" },
  { key: "grupos.contrato", label: "  ↳ Contrato" },
  { key: "motoristas", label: "Motoristas" },
  { key: "motoristas.cadastros", label: "  ↳ Cadastros" },
  { key: "motoristas.parcerias", label: "  ↳ Parcerias" },
  { key: "motoristas.solicitacoes", label: "  ↳ Solicitações" },
  { key: "motoristas.agendamentos", label: "  ↳ Agendamentos" },
  { key: "veiculos", label: "Veículos" },
  { key: "campanhas", label: "Campanhas" },
  { key: "campanhas.ativos", label: "  ↳ Ativos" },
  { key: "campanhas.leads", label: "  ↳ Leads" },
  { key: "marketing", label: "Marketing" },
  { key: "network", label: "Network" },
  { key: "google", label: "Google Business" },
  { key: "email-business", label: "E-mail Business" },
  { key: "website", label: "Website" },
  { key: "sistema", label: "Sistema" },
  { key: "sistema.configuracoes", label: "  ↳ Configurações" },
  { key: "sistema.automacoes", label: "  ↳ Automações" },
  { key: "sistema.comunicador", label: "  ↳ Comunicador" },
  { key: "sistema.usuarios", label: "  ↳ Usuários" },
  { key: "sistema.logs", label: "  ↳ Logs" },
  { key: "politicas", label: "Políticas" },
  { key: "anotacoes", label: "Anotações" },
  { key: "documentacao", label: "Documentação" },
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
              {ALL_MENUS.map((m) => (
                <div key={m.key} className="flex items-center justify-between py-1">
                  <span className={`text-sm ${m.key.includes(".") ? "pl-4 text-muted-foreground" : "font-medium text-foreground"}`}>
                    {m.label}
                  </span>
                  <Switch
                    checked={menuState[m.key] ?? true}
                    onCheckedChange={(v) => setMenuState(prev => ({ ...prev, [m.key]: v }))}
                  />
                </div>
              ))}
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
