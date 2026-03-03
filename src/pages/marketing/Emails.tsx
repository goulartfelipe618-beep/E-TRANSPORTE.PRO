import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function MarketingEmails() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">E-mails</h1>
        <p className="text-muted-foreground">Gestão de campanhas e disparos de e-mail marketing</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> E-mails Marketing</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Em desenvolvimento.</p></CardContent>
      </Card>
    </div>
  );
}
