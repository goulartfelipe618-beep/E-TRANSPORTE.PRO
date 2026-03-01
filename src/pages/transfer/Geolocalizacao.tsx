import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransferGeolocalizacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Geolocalização</h1>
        <p className="text-muted-foreground">Rastreamento em tempo real</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Mapa de Geolocalização</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
