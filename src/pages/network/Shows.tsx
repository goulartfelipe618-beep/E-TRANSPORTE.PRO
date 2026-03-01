import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkShows() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Produtores de Shows</h1>
        <p className="text-muted-foreground">Parceiros de entretenimento</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Produtores de Shows</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
