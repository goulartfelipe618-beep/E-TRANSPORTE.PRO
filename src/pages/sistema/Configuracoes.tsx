import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload, Type, Shield, Key, RefreshCw,
  Save, Loader2, Image as ImageIcon, Lock, Smartphone, MapPin
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const FONTS = [
  "Poppins", "Inter", "Roboto", "Open Sans", "Montserrat",
  "Lato", "Raleway", "Nunito", "Source Sans 3", "Work Sans"
];

export default function SistemaConfiguracoes() {
  const { toast } = useToast();
  const { settings, isLoading, upsert } = useSystemSettings();
  const { refetch: refetchGlobal } = useGlobalConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState("");
  const [font, setFont] = useState("Poppins");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mapProvider, setMapProvider] = useState("");
  const [mapApiKey, setMapApiKey] = useState("");

  useEffect(() => {
    if (!isLoading) {
      setProjectName(settings["project_name"] || "TransExec");
      setFont(settings["global_font"] || "Poppins");
      setLogoUrl(settings["logo_url"] || "");
      setMapProvider(settings["map_provider"] || "");
      setMapApiKey(settings["map_api_key"] || "");
    }
  }, [isLoading, settings]);

  const saving = upsert.isPending;

  const handleSave = async (key: string, value: string, label: string) => {
    try {
      await upsert.mutateAsync({ key, value });
      refetchGlobal();
      toast({ title: "Salvo", description: `${label} atualizado com sucesso.` });
    } catch {
      toast({ title: "Erro", description: `Falha ao salvar ${label}.`, variant: "destructive" });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logo.${ext}`;
      // Remove old
      await supabase.storage.from("logos").remove([path]);
      const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      const url = urlData.publicUrl + "?t=" + Date.now();
      setLogoUrl(url);
      await upsert.mutateAsync({ key: "logo_url", value: url });
      refetchGlobal();
      toast({ title: "Logo atualizado", description: "Logomarca salva com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar logomarca.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configurações gerais do sistema</p>
      </div>

      {/* Logomarca */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="h-5 w-5" /> Logomarca Global</CardTitle>
          <CardDescription>Upload da logomarca utilizada em todo o sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoUrl && (
            <div className="rounded-lg border p-4 bg-muted/30 flex items-center justify-center">
              <img src={logoUrl} alt="Logo" className="max-h-24 object-contain" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            {uploading ? "Enviando..." : "Enviar Logomarca"}
          </Button>
        </CardContent>
      </Card>

      {/* Nome do Projeto */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Type className="h-5 w-5" /> Nome do Projeto</CardTitle>
          <CardDescription>Nome global exibido no sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Nome do projeto" />
          <Button size="sm" onClick={() => handleSave("project_name", projectName, "Nome do projeto")} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> Salvar
          </Button>
        </CardContent>
      </Card>

      {/* Fonte Global */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Type className="h-5 w-5" /> Fonte Global</CardTitle>
          <CardDescription>Fonte utilizada em toda a interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: font }}>
            Exemplo de texto com a fonte <strong>{font}</strong>
          </p>
          <Button size="sm" onClick={() => handleSave("global_font", font, "Fonte")} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> Salvar
          </Button>
        </CardContent>
      </Card>

      {/* API de Mapas */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5" /> API de Mapas</CardTitle>
          <CardDescription>Configure a API de mapas para autocomplete de endereços e mapas no PDF de confirmação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Provedor de Mapas *</Label>
            <RadioGroup value={mapProvider} onValueChange={setMapProvider} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mapbox" id="mapbox" />
                <Label htmlFor="mapbox" className="cursor-pointer">Mapbox</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="google" id="google" />
                <Label htmlFor="google" className="cursor-pointer">Google Maps</Label>
              </div>
            </RadioGroup>
          </div>
          {mapProvider && (
            <div className="space-y-2">
              <Label className="text-sm">
                Chave de API ({mapProvider === "mapbox" ? "Mapbox Access Token" : "Google Maps API Key"}) *
              </Label>
              <Input
                type="password"
                value={mapApiKey}
                onChange={(e) => setMapApiKey(e.target.value)}
                placeholder={mapProvider === "mapbox" ? "pk.eyJ1Ijo..." : "AIzaSy..."}
              />
              <p className="text-xs text-muted-foreground">
                {mapProvider === "mapbox"
                  ? "Obtenha em mapbox.com → Account → Tokens"
                  : "Obtenha em console.cloud.google.com → APIs & Services → Credentials"}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!mapProvider || !mapApiKey || saving}
              onClick={async () => {
                await upsert.mutateAsync({ key: "map_provider", value: mapProvider });
                await upsert.mutateAsync({ key: "map_api_key", value: mapApiKey });
                refetchGlobal();
                toast({ title: "Salvo", description: "Configuração de mapas atualizada." });
              }}
            >
              <Save className="h-4 w-4 mr-2" /> Salvar
            </Button>
            {mapProvider && mapApiKey && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  setMapProvider("");
                  setMapApiKey("");
                  await upsert.mutateAsync({ key: "map_provider", value: "" });
                  await upsert.mutateAsync({ key: "map_api_key", value: "" });
                  refetchGlobal();
                  toast({ title: "Removido", description: "Configuração de mapas removida." });
                }}
              >
                Remover
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Perfil do Administrador */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Perfil do Administrador</CardTitle>
          <CardDescription>Segurança e controle de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Alteração de Senha</Label>
              <p className="text-xs text-muted-foreground">Alterar a senha de acesso do administrador</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Key className="h-4 w-4 mr-2" /> Alterar
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Autenticação em 2 Fatores (2FA)</Label>
              <p className="text-xs text-muted-foreground">Camada extra de segurança no login</p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Sessões Ativas</Label>
              <p className="text-xs text-muted-foreground">Gerencie dispositivos conectados</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Smartphone className="h-4 w-4 mr-2" /> Ver
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Log de Acessos</Label>
              <p className="text-xs text-muted-foreground">Histórico de logins e atividades</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Lock className="h-4 w-4 mr-2" /> Ver Log
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">⚠ Funcionalidades de segurança serão ativadas após implementação do sistema de autenticação.</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Hard Refresh */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><RefreshCw className="h-5 w-5" /> Hard Refresh</CardTitle>
          <CardDescription>Recarregar o sistema completamente</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleHardRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Recarregar Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
