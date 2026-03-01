import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Anotacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Anotações</h1>
        <p className="text-muted-foreground">Notas e observações importantes</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Minhas Anotações</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Suas anotações aparecerão aqui.</p></CardContent>
      </Card>
    </div>
  );
}
