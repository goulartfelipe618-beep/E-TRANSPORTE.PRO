import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransferSolicitacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de Transfer</h1>
        <p className="text-muted-foreground">Gerenciamento de solicitações</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Solicitações</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
