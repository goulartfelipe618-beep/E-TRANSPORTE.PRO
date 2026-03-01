import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SistemaConfiguracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configurações gerais do sistema</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
