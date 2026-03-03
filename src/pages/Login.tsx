import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, ShieldCheck, Car, Clock, Route, CalendarCheck } from "lucide-react";
import loginDriverImage from "@/assets/login-driver.jpg";

const RECAPTCHA_SITE_KEY = "6LdM1n4sAAAAAEEurMKThPckhpxdaZA6Wgx2k12i";

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load reCAPTCHA script
    if (document.querySelector('script[src*="recaptcha"]')) {
      if (window.grecaptcha?.render) {
        renderCaptcha();
      }
      return;
    }

    window.onRecaptchaLoad = () => {
      setRecaptchaReady(true);
    };

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete (window as any).onRecaptchaLoad;
    };
  }, []);

  const renderCaptcha = useCallback(() => {
    if (recaptchaRef.current && window.grecaptcha?.render) {
      try {
        recaptchaRef.current.innerHTML = "";
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => setRecaptchaToken(token),
          "expired-callback": () => setRecaptchaToken(null),
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (recaptchaReady) {
      renderCaptcha();
    }
  }, [recaptchaReady, renderCaptcha]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (!recaptchaToken) {
      toast({ title: "Complete o reCAPTCHA", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Verify reCAPTCHA on backend
    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: recaptchaToken },
      });

      if (verifyError || !verifyData?.success) {
        toast({ title: "Verificação reCAPTCHA falhou", description: "Tente novamente.", variant: "destructive" });
        setRecaptchaToken(null);
        if (window.grecaptcha) window.grecaptcha.reset();
        setLoading(false);
        return;
      }
    } catch {
      toast({ title: "Erro na verificação", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      setRecaptchaToken(null);
      if (window.grecaptcha) window.grecaptcha.reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side — Hero */}
      <div className="relative hidden lg:flex lg:w-[55%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-amber-400 blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-500 blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6">
              Transporte Executivo
            </span>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Gestão Inteligente<br />de Transfers
            </h1>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Automatize operações, organize sua frota e ofereça uma experiência premium aos seus passageiros.
            </p>
          </div>

          <div className="relative flex-1 flex items-end justify-center mt-8">
            <img
              src={loginDriverImage}
              alt="Motorista executivo"
              className="h-[420px] xl:h-[500px] object-contain object-bottom drop-shadow-2xl"
            />
            <div className="absolute top-8 left-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg">
              <Clock className="h-5 w-5 text-amber-400" />
              <span className="text-white text-sm font-medium">Automação</span>
            </div>
            <div className="absolute top-28 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg">
              <Route className="h-5 w-5 text-amber-400" />
              <span className="text-white text-sm font-medium">Rotas</span>
            </div>
            <div className="absolute bottom-40 left-0 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg">
              <Car className="h-5 w-5 text-amber-400" />
              <span className="text-white text-sm font-medium">Frota</span>
            </div>
            <div className="absolute bottom-56 right-0 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg">
              <CalendarCheck className="h-5 w-5 text-amber-400" />
              <span className="text-white text-sm font-medium">Agendamentos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — Login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
              <Car className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta!</h2>
            <p className="text-muted-foreground text-sm">Entre com os seus dados nos campos abaixo para fazer login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12"
              />
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <div ref={recaptchaRef} />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading || !recaptchaToken}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
              Iniciar Sessão
            </Button>
          </form>

          {/* Security notice */}
          <div className="rounded-xl border border-border bg-muted/50 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-foreground text-sm">Aviso de Segurança</h3>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li>• Mantenha as suas credenciais privadas e confidenciais;</li>
              <li>• Nunca utilize senhas simples, óbvias ou já usadas em outros sistemas;</li>
              <li>• Recomendamos que altere sua senha periodicamente;</li>
              <li>• Em caso de atividade suspeita, altere sua senha imediatamente.</li>
            </ul>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
