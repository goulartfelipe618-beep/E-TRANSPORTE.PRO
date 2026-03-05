import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Code2, Copy, Check, ExternalLink, FileJson, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Campo {
  key: string;
  label: string;
  type?: "text" | "image";
}

interface Category {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  campos: Campo[];
  ativo: boolean;
}

export default function MasterDeveloper() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const webhookBase = `${supabaseUrl}/functions/v1/webhook-solicitacao`;

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("automation_categories")
      .select("*")
      .eq("ativo", true)
      .order("nome");
    if (data) {
      setCategories(
        data.map((c: any) => ({
          ...c,
          campos: Array.isArray(c.campos) ? c.campos : [],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast({ title: "Copiado!", description: `${label} copiado para a área de transferência.` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => copyToClipboard(text, label)}
    >
      {copiedField === label ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  const generateJsonExample = (cat: Category) => {
    const obj: Record<string, string> = {};
    cat.campos.forEach((c) => {
      obj[c.key] = c.type === "image" ? "https://exemplo.com/imagem.jpg" : `valor_${c.key}`;
    });
    return JSON.stringify(obj, null, 2);
  };

  const generateCurlExample = (cat: Category) => {
    const fields = cat.campos
      .map((c) =>
        c.type === "image"
          ? `  -F "${c.key}=@/caminho/para/arquivo.jpg"`
          : `  -F "${c.key}=valor_exemplo"`
      )
      .join(" \\\n");

    return `curl -X POST "${webhookBase}?automacao_id=SEU_AUTOMACAO_ID" \\\n${fields}`;
  };

  const generateJsonCurl = (cat: Category) => {
    const json = generateJsonExample(cat);
    return `curl -X POST "${webhookBase}?automacao_id=SEU_AUTOMACAO_ID" \\\n  -H "Content-Type: application/json" \\\n  -d '${json}'`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            Documentação do Desenvolvedor
          </h1>
          <p className="text-muted-foreground">
            Referência completa das variáveis aceitas por cada categoria de webhook.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchCategories}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Endpoint Base */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Endpoint Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
            <code className="text-sm font-mono flex-1 break-all text-foreground">
              POST {webhookBase}?automacao_id=<span className="text-primary">&#123;ID_DA_AUTOMACAO&#125;</span>
            </code>
            <CopyButton text={`${webhookBase}?automacao_id=`} label="endpoint" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Substitua <code className="bg-muted px-1 rounded">&#123;ID_DA_AUTOMACAO&#125;</code> pelo UUID da automação criada pelo administrador.
            O formato aceito é <strong>JSON</strong>, <strong>form-urlencoded</strong> ou <strong>multipart/form-data</strong> (para envio de arquivos).
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {loading ? (
        <p className="text-muted-foreground text-sm p-6">Carregando categorias...</p>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Code2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Nenhuma categoria ativa cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  {cat.nome}
                </CardTitle>
                <Badge variant="outline">
                  <code className="text-xs">{cat.slug}</code>
                </Badge>
              </div>
              {cat.descricao && (
                <p className="text-sm text-muted-foreground">{cat.descricao}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Variables Table */}
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Variáveis Aceitas ({cat.campos.length})
                </h4>
                {cat.campos.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma variável definida para esta categoria.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variável (key)</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.campos.map((campo) => (
                        <TableRow key={campo.key}>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">
                              {campo.key}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm">{campo.label}</TableCell>
                          <TableCell>
                            <Badge
                              variant={campo.type === "image" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {campo.type === "image" ? "📷 Arquivo/Imagem" : "📝 Texto"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <CopyButton text={campo.key} label={`var-${campo.key}`} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Code Examples */}
              {cat.campos.length > 0 && (
                <Tabs defaultValue="json" className="w-full">
                  <TabsList>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                    <TabsTrigger value="curl-json">cURL (JSON)</TabsTrigger>
                    <TabsTrigger value="curl-form">cURL (Form-Data)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="json">
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto text-foreground">
                        {generateJsonExample(cat)}
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyButton
                          text={generateJsonExample(cat)}
                          label={`json-${cat.slug}`}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="curl-json">
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto text-foreground whitespace-pre-wrap">
                        {generateJsonCurl(cat)}
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyButton
                          text={generateJsonCurl(cat)}
                          label={`curl-json-${cat.slug}`}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="curl-form">
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto text-foreground whitespace-pre-wrap">
                        {generateCurlExample(cat)}
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyButton
                          text={generateCurlExample(cat)}
                          label={`curl-form-${cat.slug}`}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Notes */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-sm font-semibold mb-3">📌 Notas Importantes</h4>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>As variáveis listadas acima são definidas globalmente pelo Master Admin em <strong>Categorias de Automação</strong>.</li>
            <li>Quando uma variável é adicionada, editada ou removida, a mudança é refletida automaticamente em todas as automações dos administradores comuns que utilizam aquela categoria.</li>
            <li>Campos do tipo <strong>Imagem</strong> devem ser enviados como arquivo via <code className="bg-muted px-1 rounded">multipart/form-data</code>, ou como URL em texto via JSON.</li>
            <li>O <code className="bg-muted px-1 rounded">automacao_id</code> é gerado pelo administrador comum ao criar uma nova automação no painel.</li>
            <li>Para testes, envie dados com o webhook <strong>desativado</strong>. Os payloads aparecerão na aba de testes da automação.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
