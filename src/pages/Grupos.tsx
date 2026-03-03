import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Grupos() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
          <p className="text-muted-foreground">Gestão de transporte para grupos</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Nova Solicitação</Button>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Próximos Grupos</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhum grupo agendado.</p>
        </CardContent>
      </Card>
    </div>
  );
}
