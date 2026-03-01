import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkHoteis() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hotéis e Resorts</h1>
        <p className="text-muted-foreground">Parceiros hoteleiros</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Hotéis e Resorts</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
