import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Sistema() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sistema</h1>
        <p className="text-muted-foreground">Configurações gerais do sistema</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Configurações do sistema serão exibidas aqui.</p></CardContent>
      </Card>
    </div>
  );
}
