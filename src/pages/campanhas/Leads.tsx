import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampanhasLeads() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-muted-foreground">Gestão de leads de campanhas</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Leads</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
