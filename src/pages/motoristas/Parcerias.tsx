import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MotoristasParcerias() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parcerias</h1>
        <p className="text-muted-foreground">Gestão de motoristas parceiros</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Parcerias</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
