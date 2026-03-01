import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Politicas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Políticas</h1>
        <p className="text-muted-foreground">Políticas e regulamentos da empresa</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Políticas Vigentes</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Políticas da empresa serão exibidas aqui.</p></CardContent>
      </Card>
    </div>
  );
}
