import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Campanhas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Campanhas</h1>
        <p className="text-muted-foreground">Gerencie campanhas promocionais</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Campanhas Ativas</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Nenhuma campanha ativa no momento.</p></CardContent>
      </Card>
    </div>
  );
}
