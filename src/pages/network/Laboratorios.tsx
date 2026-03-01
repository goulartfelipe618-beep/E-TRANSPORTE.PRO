import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkLaboratorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Laboratórios e Farmácias</h1>
        <p className="text-muted-foreground">Parceiros farmacêuticos</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Laboratórios e Farmácias</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
