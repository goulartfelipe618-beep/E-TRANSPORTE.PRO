import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Key, Save, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MasterSecurity() {
  const { toast } = useToast();

  // Password
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  // MFA
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [mfaQr, setMfaQr] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || "");
    });
  }, []);

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
      setNewPwd("");
      setConfirmPwd("");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setPwdSaving(false);
    }
  };

  const fetchMfaFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data) setMfaFactors(data.totp || []);
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
      toast({ title: "Erro", description: e.message, variant: "destructive" });
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
      toast({ title: "2FA ativado", description: "Autenticação em dois fatores configurada." });
      setMfaEnrolling(false);
      setMfaQr("");
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
      toast({ title: "2FA removido" });
      await fetchMfaFactors();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const hasVerifiedFactor = mfaFactors.some((f) => f.status === "verified");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Segurança</h1>
        <p className="text-muted-foreground">Gerencie sua senha e autenticação em dois fatores.</p>
      </div>

      {userEmail && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Logado como: <strong className="text-foreground">{userEmail}</strong></p>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Key className="h-5 w-5" /> Senha</CardTitle>
          <CardDescription>Altere sua senha de acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setPwdDialogOpen(true)}>
            <Key className="h-4 w-4 mr-2" /> Alterar Senha
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Autenticação em 2 Fatores (2FA)</CardTitle>
          <CardDescription>Configure segurança adicional via app autenticador (TOTP)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleOpenMfa}>
            <Lock className="h-4 w-4 mr-2" /> Configurar 2FA
          </Button>
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <Dialog open={pwdDialogOpen} onOpenChange={setPwdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>Digite sua nova senha.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar</Label>
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
            <DialogTitle>Autenticação em 2 Fatores</DialogTitle>
            <DialogDescription>Use Google Authenticator ou Authy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
