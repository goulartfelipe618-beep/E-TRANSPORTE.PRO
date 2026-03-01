import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function DashboardMetricas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Métricas</h1>
        <p className="text-muted-foreground">Indicadores de performance e KPIs</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Métricas Gerais</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
