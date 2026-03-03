import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function MarketingReceptivos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Receptivos</h1>
        <p className="text-muted-foreground">Gestão de receptivos e pontos de captação</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Receptivos</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
