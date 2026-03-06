import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, CheckCircle2, XCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DomainResult {
  domain: string;
  status: string;
  available: boolean;
  reason?: string;
  fqdn?: string;
  hosts?: string[];
  publicationStatus?: string;
  expiresAt?: string;
}

export default function DominiosPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);
  const [error, setError] = useState("");

  const normalizeDomain = (input: string): string => {
    let d = input.trim().toLowerCase().replace(/\s+/g, "");
    d = d.replace(/^https?:\/\//, "");
    d = d.replace(/\/+$/, "");
    if (!d.includes(".")) {
      d = `${d}.com.br`;
    } else if (d.endsWith(".com") && !d.endsWith(".com.br")) {
      d = `${d}.br`;
    }
    return d;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    const domain = normalizeDomain(query);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("domain-lookup", {
        body: { domain },
      });

      if (fnError) {
        setError("Erro ao consultar domínio. Tente novamente.");
        return;
      }

      if (!data.success) {
        setError(data.error || "Erro ao consultar domínio.");
        return;
      }

      setResult({
        domain: data.domain,
        status: data.status,
        available: data.available,
        fqdn: data.fqdn,
        hosts: data.hosts,
        publicationStatus: data.publicationStatus,
        expiresAt: data.expiresAt,
      });
    } catch (err: any) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Domínios</h1>
        <p className="text-muted-foreground">
          Pesquise a disponibilidade de domínios .br e garanta o endereço digital da sua empresa.
        </p>
      </div>

      {/* Search Card */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Buscar Domínio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite o nome desejado, ex: meunegocio"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                .com.br
              </span>
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Pesquisar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            O sistema adiciona automaticamente <strong>.com.br</strong> caso você não informe a extensão.
          </p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className={`border-none shadow-sm ${result.available ? "ring-1 ring-emerald-500/30" : "ring-1 ring-destructive/30"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {result.available ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                )}
                <div>
                  <p className="font-mono font-bold text-lg text-foreground">{result.domain}</p>
                  <Badge className={result.available ? "bg-emerald-600 text-white" : "bg-destructive text-white"}>
                    {result.available ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
              </div>

              {result.available && (
                <Button
                  className="gap-2"
                  onClick={() =>
                    window.open(`https://registro.br/busca-dominio/?fqdn=${encodeURIComponent(result.domain)}`, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  Registrar
                </Button>
              )}
            </div>

            {/* Details for unavailable domains */}
            {!result.available && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Detalhes do domínio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <span className="text-foreground font-medium">{result.status}</span>
                  </div>
                  {result.fqdn && (
                    <div>
                      <span className="text-muted-foreground">FQDN: </span>
                      <span className="text-foreground font-mono">{result.fqdn}</span>
                    </div>
                  )}
                  {result.publicationStatus && (
                    <div>
                      <span className="text-muted-foreground">Publicação: </span>
                      <span className="text-foreground">{result.publicationStatus}</span>
                    </div>
                  )}
                  {result.expiresAt && (
                    <div>
                      <span className="text-muted-foreground">Expira em: </span>
                      <span className="text-foreground">{new Date(result.expiresAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                  {result.hosts && result.hosts.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">DNS Servers: </span>
                      <span className="text-foreground font-mono text-xs">{result.hosts.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-none bg-muted/50">
        <CardContent className="pt-6 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Por que ter um domínio próprio?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Presença digital</strong> — Seu negócio precisa de um endereço profissional na internet.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Autoridade</strong> — Domínio próprio passa mais confiança para clientes e parceiros.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>E-mail profissional</strong> — Use seu domínio para criar e-mails como contato@suaempresa.com.br.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Conversão</strong> — Um site com domínio próprio converte mais corridas e reservas.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
