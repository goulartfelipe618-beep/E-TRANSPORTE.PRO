import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Marketing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing</h1>
        <p className="text-muted-foreground">Métricas e estratégias de marketing</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Visão Geral</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Dados de marketing serão exibidos aqui.</p></CardContent>
      </Card>
    </div>
  );
}
