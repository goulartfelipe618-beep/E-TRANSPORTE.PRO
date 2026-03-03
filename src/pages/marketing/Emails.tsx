import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, CheckCircle2, Shield, Globe } from "lucide-react";

export default function MarketingEmails() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">E-mails Profissionais</h1>
        <p className="text-muted-foreground">Tenha um e-mail corporativo com o seu domínio</p>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/15 backdrop-blur">
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">E-mail Profissional</h2>
              <p className="text-primary-foreground/80 text-sm">contato@seudominio.com.br</p>
            </div>
          </div>
          <p className="text-primary-foreground/90 text-base md:text-lg max-w-2xl mb-8">
            Transmita credibilidade e profissionalismo com um endereço de e-mail personalizado.
            Ideal para empresas de transfer executivo que buscam uma comunicação impecável.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4 backdrop-blur">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Seu Domínio</p>
                <p className="text-xs text-primary-foreground/70">E-mail com o nome da sua empresa</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4 backdrop-blur">
              <Shield className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Seguro & Confiável</p>
                <p className="text-xs text-primary-foreground/70">Anti-spam e criptografia inclusos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4 backdrop-blur">
              <Globe className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Acesso em Qualquer Lugar</p>
                <p className="text-xs text-primary-foreground/70">Webmail, celular e desktop</p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="gap-2 text-base font-semibold"
            onClick={() => window.open("https://e-transporte.pro/emails", "_blank")}
          >
            <ExternalLink className="h-5 w-5" />
            Criar meu E-mail Profissional
          </Button>
        </div>
      </Card>
    </div>
  );
}
