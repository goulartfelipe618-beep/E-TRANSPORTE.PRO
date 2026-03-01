import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransferContrato() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contrato</h1>
        <p className="text-muted-foreground">Gestão de contratos de transfer</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Contratos</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
