import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload, Type, Shield, Key, RefreshCw,
  Save, Loader2, Image as ImageIcon, Lock, Smartphone, User
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

  // Password change
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  // 2FA
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [mfaQr, setMfaQr] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerifying, setMfaVerifying] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProjectName(settings["project_name"] || "TransExec");
      setFont(settings["global_font"] || "Poppins");
      setLogoUrl(settings["logo_url"] || "");
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

  const handlePasswordChange = async () => {
    if (newPwd !== confirmPwd) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (newPwd.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
      setPwdDialogOpen(false);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao alterar senha.", variant: "destructive" });
    } finally {
      setPwdSaving(false);
    }
  };

  // MFA functions
  const fetchMfaFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data) {
      setMfaFactors(data.totp || []);
    }
  };

  const handleOpenMfa = async () => {
    await fetchMfaFactors();
    setMfaDialogOpen(true);
    setMfaEnrolling(false);
    setMfaQr("");
    setMfaSecret("");
    setMfaCode("");
  };

  const handleEnrollMfa = async () => {
    setMfaEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      if (data) {
        setMfaQr(data.totp.qr_code);
        setMfaSecret(data.totp.secret);
        setMfaFactorId(data.id);
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao configurar 2FA.", variant: "destructive" });
      setMfaEnrolling(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      toast({ title: "Erro", description: "Insira o código de 6 dígitos.", variant: "destructive" });
      return;
    }
    setMfaVerifying(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode });
      if (verifyError) throw verifyError;
      toast({ title: "2FA ativado", description: "Autenticação em dois fatores configurada com sucesso." });
      setMfaEnrolling(false);
      setMfaQr("");
      setMfaSecret("");
      setMfaCode("");
      await fetchMfaFactors();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Código inválido.", variant: "destructive" });
    } finally {
      setMfaVerifying(false);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast({ title: "2FA removido", description: "Autenticação em dois fatores desativada." });
      await fetchMfaFactors();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao remover 2FA.", variant: "destructive" });
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

  const hasVerifiedFactor = mfaFactors.some((f) => f.status === "verified");

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

      <Separator />

      {/* Segurança */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Segurança</CardTitle>
          <CardDescription>Altere sua senha e configure autenticação em dois fatores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Alteração de Senha</Label>
              <p className="text-xs text-muted-foreground">Alterar a senha de acesso</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPwdDialogOpen(true)}>
              <Key className="h-4 w-4 mr-2" /> Alterar
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Autenticação em 2 Fatores (2FA)</Label>
              <p className="text-xs text-muted-foreground">Camada extra de segurança via app autenticador (TOTP)</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleOpenMfa}>
              <Lock className="h-4 w-4 mr-2" /> Configurar
            </Button>
          </div>
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

      {/* Password Dialog */}
      <Dialog open={pwdDialogOpen} onOpenChange={setPwdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>Digite sua nova senha abaixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Repita a nova senha" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handlePasswordChange} disabled={pwdSaving}>
              {pwdSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MFA Dialog */}
      <Dialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Autenticação em 2 Fatores (2FA)</DialogTitle>
            <DialogDescription>Configure usando um app autenticador como Google Authenticator ou Authy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing factors */}
            {mfaFactors.filter(f => f.status === "verified").length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-600">✓ 2FA Ativo</Label>
                {mfaFactors.filter(f => f.status === "verified").map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">TOTP configurado</span>
                    <Button variant="destructive" size="sm" onClick={() => handleUnenrollMfa(f.id)}>Remover</Button>
                  </div>
                ))}
              </div>
            )}

            {/* Enroll flow */}
            {!hasVerifiedFactor && !mfaEnrolling && (
              <Button onClick={handleEnrollMfa} className="w-full">
                <Shield className="h-4 w-4 mr-2" /> Ativar 2FA
              </Button>
            )}

            {mfaEnrolling && mfaQr && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={mfaQr} alt="QR Code 2FA" className="w-48 h-48 rounded-lg border" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ou insira manualmente:</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">{mfaSecret}</code>
                </div>
                <div className="space-y-2">
                  <Label>Código de verificação (6 dígitos)</Label>
                  <Input
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button onClick={handleVerifyMfa} disabled={mfaVerifying} className="w-full">
                  {mfaVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Verificar e Ativar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
