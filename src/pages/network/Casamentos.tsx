import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkCasamentos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Empresas de Casamento</h1>
        <p className="text-muted-foreground">Parceiros de eventos</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Empresas de Casamento</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
