import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Documentacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentação</h1>
        <p className="text-muted-foreground">Documentos e manuais do sistema</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Documentos</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Documentação do sistema será exibida aqui.</p></CardContent>
      </Card>
    </div>
  );
}
