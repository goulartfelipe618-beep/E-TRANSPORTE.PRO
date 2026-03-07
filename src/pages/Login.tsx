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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #0d0d0d 100%)" }}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/[0.08]" style={{ background: "#161616" }}>
        {/* Illustration header */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={loginIllustration}
            alt="Transporte Executivo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #161616 0%, transparent 60%)" }} />
        </div>

        {/* Form body */}
        <div className="px-8 pb-8 pt-2 space-y-6">
          <h2 className="text-2xl font-bold text-center" style={{ color: "#f0f0f0" }}>
            Faça seu Login
          </h2>

          {blocked && (
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
              <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                Acesso bloqueado por excesso de tentativas.
              </p>
              <p className="text-xs mt-1" style={{ color: "#888" }}>
                Tente novamente em {blockMinutes} minutos.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#666" }} />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setBlocked(false); }}
                autoComplete="email"
                className="w-full h-12 pl-10 pr-4 rounded-lg text-sm outline-none transition-colors"
                style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#666" }} />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-12 pl-10 pr-4 rounded-lg text-sm outline-none transition-colors"
                style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <KeyRound className="h-4 w-4 shrink-0" style={{ color: "#666" }} />
                <div
                  className="select-none px-4 py-2 rounded-lg font-mono text-base tracking-[0.3em] font-bold italic"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#d0d0d0",
                    textDecoration: "line-through",
                    textDecorationColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="shrink-0 p-2 rounded-lg transition-colors hover:bg-white/5"
                >
                  <RefreshCw className="h-4 w-4" style={{ color: "#888" }} />
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#666" }} />
                <input
                  placeholder="Digite o código acima"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-lg text-sm font-mono tracking-widest outline-none transition-colors"
                  style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
                  maxLength={5}
                  autoComplete="off"
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 text-sm font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "#fff", color: "#0a0a0a" }}
              disabled={loading || captchaInput.length < 5 || blocked}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "#e0e0e0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
              Iniciar Sessão
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: "#555" }}>
            © {new Date().getFullYear()} — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
