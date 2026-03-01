import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MotoristasSolicitacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de Motoristas</h1>
        <p className="text-muted-foreground">Solicitações pendentes</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Solicitações</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
