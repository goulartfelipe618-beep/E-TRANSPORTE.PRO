import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkClinicas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clínicas e Hospitais</h1>
        <p className="text-muted-foreground">Parceiros da área de saúde</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Clínicas e Hospitais</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
