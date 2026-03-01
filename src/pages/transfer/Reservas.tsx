import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransferReservas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground">Gestão de reservas de transfer</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Reservas</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
