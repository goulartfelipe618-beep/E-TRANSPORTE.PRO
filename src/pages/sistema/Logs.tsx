import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SistemaLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs</h1>
        <p className="text-muted-foreground">Registro de atividades do sistema</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Logs do Sistema</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
