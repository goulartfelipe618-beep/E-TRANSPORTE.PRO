import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Network() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Network</h1>
        <p className="text-muted-foreground">Rede de parceiros e conexões</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Parceiros</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Gerencie sua rede de parceiros aqui.</p></CardContent>
      </Card>
    </div>
  );
}
