import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SistemaAplicativo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aplicativo</h1>
        <p className="text-muted-foreground">Configurações do aplicativo</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Aplicativo</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
