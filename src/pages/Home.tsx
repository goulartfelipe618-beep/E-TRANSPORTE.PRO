import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Mail, Globe, Building2, ShoppingCart, Users, BarChart3, Car, Handshake, ArrowRightLeft } from "lucide-react";
import { useActivePage } from "@/contexts/PageContext";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import defaultSlide1 from "@/assets/slide-1.jpg";
import defaultSlide2 from "@/assets/slide-2.jpg";
import defaultSlide3 from "@/assets/slide-3.jpg";

interface SlideData {
  image: string;
  title: string;
  subtitle: string;
}

const DEFAULT_SLIDES: SlideData[] = [
  { image: defaultSlide1, title: "Impulsione seu Transporte Executivo", subtitle: "Gerencie sua frota, motoristas e corridas com tecnologia de ponta." },
  { image: defaultSlide2, title: "Parcerias Estratégicas", subtitle: "Conecte-se a uma rede de parceiros e expanda sua atuação no mercado." },
  { image: defaultSlide3, title: "Gestão Completa de Frota", subtitle: "Controle total sobre veículos, métricas e operações em um só lugar." },
];

const tools = [
  { icon: Mail, title: "E-mail Profissional", desc: "Crie e-mails corporativos com o domínio da sua empresa para credibilidade total.", page: "email-business" as const },
  { icon: Globe, title: "Criação de Website", desc: "Tenha seu site profissional no ar em minutos, com design exclusivo para transporte.", page: "website" as const },
  { icon: Building2, title: "Google Meu Negócio", desc: "Apareça no Google Maps e nas buscas locais com perfil verificado.", page: "google" as const },
  { icon: ShoppingCart, title: "Domínio Oficial", desc: "Registre seu domínio .com.br direto pela plataforma com planos acessíveis.", page: "dominios" as const },
  { icon: Users, title: "Network", desc: "Construa sua rede de contatos com hotéis, agências e parceiros estratégicos.", page: "network" as const },
  { icon: BarChart3, title: "Métricas & Análises", desc: "Acompanhe KPIs, volume de corridas e desempenho da sua operação em tempo real.", page: "dashboard/metricas" as const },
  { icon: Car, title: "Gestão de Veículos", desc: "Cadastre e controle sua frota com documentação, status e manutenção.", page: "veiculos" as const },
  { icon: ArrowRightLeft, title: "Transfer & Reservas", desc: "Gerencie solicitações, reservas e contratos de transfer executivo.", page: "transfer/solicitacoes" as const },
  { icon: Handshake, title: "Parcerias & Motoristas", desc: "Cadastre motoristas, parceiros e gerencie a operação colaborativa.", page: "motoristas/cadastros" as const },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<SlideData[]>(DEFAULT_SLIDES);
  const { setActivePage } = useActivePage();
  const { projectName } = useGlobalConfig();
  const tenantId = useTenantId();

  // Load custom slides from DB
  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      const { data } = await supabase
        .from("home_slides")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("ativo", true)
        .order("posicao", { ascending: true });
      if (data && data.length > 0) {
        setSlides(data.map((s: any) => ({
          image: s.imagem_url,
          title: s.titulo,
          subtitle: s.subtitulo,
        })));
        setCurrent(0);
      }
    };
    load();
  }, [tenantId]);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div className="relative h-[260px] sm:h-[340px] md:h-[400px]">
          {slides.map((slide, i) => (
            <div
              key={`slide-${i}-${slide.title}`}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight max-w-xl">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-base text-white/80 mt-2 max-w-lg">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-lg p-2 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-lg p-2 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={`dot-${i}`} onClick={() => setCurrent(i)} className={`h-2.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2.5 bg-white/50"}`} />
          ))}
        </div>
      </div>

      {/* Section title */}
      <div className="text-center space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">Ferramentas Disponíveis</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">Tudo o que você precisa para impulsionar seu transporte executivo em uma única plataforma.</p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button key={tool.title} onClick={() => setActivePage(tool.page)} className="group text-left bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center h-11 w-11 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <tool.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm">{tool.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-center space-y-2">
        <p className="text-sm font-medium text-foreground">🚗 {projectName} — Plataforma completa para Transporte Executivo</p>
        <p className="text-xs text-muted-foreground">Gestão de frota, marketing digital, network e muito mais. Tudo integrado para o seu crescimento.</p>
      </div>
    </div>
  );
}
