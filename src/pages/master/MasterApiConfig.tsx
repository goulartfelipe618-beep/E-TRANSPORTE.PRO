import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, KeyRound, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiConfig {
  id: string;
  provider: string;
  config: Record<string, string>;
  ativo: boolean;
}

const PROVIDERS = [
  { key: "google_maps", label: "Google Maps API", fields: ["api_key"] },
  { key: "google_places", label: "Google Places API", fields: ["api_key"] },
  { key: "mapbox", label: "Mapbox API", fields: ["access_token"] },
  { key: "whatsapp", label: "WhatsApp Business API", fields: ["api_url", "api_token"] },
  { key: "smtp", label: "SMTP (E-mail)", fields: ["host", "port", "user", "password", "from_email"] },
];

export default function MasterApiConfig() {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    setLoading(true);
    const { data } = await supabase.from("api_configs").select("*").order("provider");
    if (data) setConfigs(data.map((c: any) => ({ ...c, config: (c.config as Record<string, string>) || {} })));
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const addProvider = async (providerKey: string) => {
    const { error } = await supabase.from("api_configs").insert({ provider: providerKey, config: {}, ativo: false });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchConfigs();
  };

  const handleSave = async (config: ApiConfig) => {
    setSaving(config.id);
    const { error } = await supabase.from("api_configs").update({ config: config.config as any, ativo: config.ativo }).eq("id", config.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Configuração salva!" });
    setSaving(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("api_configs").delete().eq("id", id);
    fetchConfigs();
    toast({ title: "Configuração removida" });
  };

  const updateField = (configId: string, field: string, value: string) => {
    setConfigs(prev => prev.map(c => {
      if (c.id !== configId) return c;
      return { ...c, config: { ...c.config, [field]: value } };
    }));
  };

  const toggleActive = (configId: string, ativo: boolean) => {
    setConfigs(prev => prev.map(c => c.id === configId ? { ...c, ativo } : c));
  };

  const existingProviders = new Set(configs.map(c => c.provider));
  const availableProviders = PROVIDERS.filter(p => !existingProviders.has(p.key));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">APIs & Configurações</h1>
          <p className="text-muted-foreground">Configure APIs externas globais do sistema.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchConfigs}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <>
          {configs.map((config) => {
            const provider = PROVIDERS.find(p => p.key === config.provider);
            return (
              <Card key={config.id} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{provider?.label || config.provider}</CardTitle>
                    <Switch checked={config.ativo} onCheckedChange={(v) => toggleActive(config.id, v)} />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleSave(config)} disabled={saving === config.id}>
                      <Save className="h-3 w-3 mr-1" />
                      {saving === config.id ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(config.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(provider?.fields || Object.keys(config.config)).map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">{field.replace(/_/g, " ")}</label>
                        <Input
                          type={field.includes("password") || field.includes("token") || field.includes("key") || field.includes("secret") ? "password" : "text"}
                          value={config.config[field] || ""}
                          onChange={(e) => updateField(config.id, field, e.target.value)}
                          placeholder={`Inserir ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {availableProviders.length > 0 && (
            <Card className="border-dashed border-2 shadow-none">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-foreground mb-3">Adicionar API</p>
                <div className="flex flex-wrap gap-2">
                  {availableProviders.map((p) => (
                    <Button key={p.key} variant="outline" size="sm" onClick={() => addProvider(p.key)}>
                      <Plus className="h-3 w-3 mr-1" />{p.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
