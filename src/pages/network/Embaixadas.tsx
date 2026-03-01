import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkEmbaixadas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Embaixadas e Consulados</h1>
        <p className="text-muted-foreground">Relações diplomáticas</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Embaixadas e Consulados</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
