import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkGoverno() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Órgãos Governamentais</h1>
        <p className="text-muted-foreground">Parceiros governamentais</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Órgãos Governamentais</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
