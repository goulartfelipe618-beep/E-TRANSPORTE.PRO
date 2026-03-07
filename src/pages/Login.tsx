import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, Lock, Mail, RefreshCw, KeyRound } from "lucide-react";
import loginIllustration from "@/assets/login-illustration.jpg";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [blockMinutes, setBlockMinutes] = useState(0);
  const { toast } = useToast();

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      toast({ title: "Código de verificação incorreto", variant: "destructive" });
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      const { data: rlData } = await supabase.functions.invoke("rate-limit", {
        body: { email: email.trim().toLowerCase(), action: "check" },
      });
      if (rlData?.blocked) {
        setBlocked(true);
        setBlockMinutes(rlData.window_minutes || 15);
        toast({
          title: "Acesso temporariamente bloqueado",
          description: `Muitas tentativas. Tente novamente em ${rlData.window_minutes || 15} minutos.`,
          variant: "destructive",
        });
        setLoading(false);
        refreshCaptcha();
        return;
      }
    } catch {
      // proceed
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    try {
      await supabase.functions.invoke("rate-limit", {
        body: { email: email.trim().toLowerCase(), action: "record", success: !error },
      });
    } catch {
      // non-blocking
    }

    if (error) {
      setLoading(false);
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      refreshCaptcha();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role, tenant_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleData?.role !== "master_admin" && roleData?.tenant_id) {
          const { data: tenant } = await supabase
            .from("tenants")
            .select("ativo")
            .eq("id", roleData.tenant_id)
            .maybeSingle();

          if (tenant && !tenant.ativo) {
            await supabase.auth.signOut();
            setLoading(false);
            toast({
              title: "Conta suspensa",
              description: "Sua conta está temporariamente suspensa. Entre em contato com o administrador.",
              variant: "destructive",
            });
            refreshCaptcha();
            return;
          }
        }
      }
    } catch {
      // non-blocking
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute bottom-10 right-[10%] w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/40 rounded-full" />
        <div className="absolute top-1/5 left-1/3 w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute bottom-1/4 left-1/5 w-1 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-black/40 bg-background">
        {/* Illustration header */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={loginIllustration}
            alt="Transporte Executivo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Form body */}
        <div className="px-8 pb-8 pt-2 space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Faça seu Login
          </h2>

          {blocked && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center">
              <p className="text-sm font-medium text-destructive">
                Acesso bloqueado por excesso de tentativas.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente novamente em {blockMinutes} minutos.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setBlocked(false); }}
                autoComplete="email"
                className="h-12 pl-10 rounded-full border-border bg-muted/50"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12 pl-10 rounded-full border-border bg-muted/50"
              />
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                <div
                  className="select-none px-4 py-2 rounded-lg bg-muted border border-border font-mono text-base tracking-[0.3em] text-foreground font-bold italic"
                  style={{ textDecoration: "line-through", textDecorationColor: "hsl(var(--muted-foreground) / 0.3)" }}
                >
                  {captchaCode}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={refreshCaptcha} className="shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o código acima"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="h-12 pl-10 rounded-full border-border bg-muted/50 font-mono tracking-widest"
                  maxLength={5}
                  autoComplete="off"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-full"
              disabled={loading || captchaInput.length < 5 || blocked}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
              Iniciar Sessão
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
