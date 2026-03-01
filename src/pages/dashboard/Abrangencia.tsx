import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function DashboardAbrangencia() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abrangência</h1>
        <p className="text-muted-foreground">Cobertura geográfica das operações</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Mapa de Abrangência</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
