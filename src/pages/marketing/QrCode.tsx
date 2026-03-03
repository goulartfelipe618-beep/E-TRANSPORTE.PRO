import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export default function MarketingQrCode() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Code</h1>
        <p className="text-muted-foreground">Geração e gestão de QR Codes para campanhas</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> QR Codes</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
