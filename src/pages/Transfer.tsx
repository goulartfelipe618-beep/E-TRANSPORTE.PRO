import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Transfer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfers</h1>
          <p className="text-muted-foreground">Gestão de corridas e agendamentos</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Novo Transfer</Button>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Próximos Transfers</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhum transfer agendado. Clique em "Novo Transfer" para criar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
