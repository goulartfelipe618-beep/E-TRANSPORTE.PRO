import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car } from "lucide-react";

const veiculos = [
  { id: "V-001", modelo: "Mercedes S500", placa: "ABC-1234", ano: 2024, status: "Disponível", motorista: "Carlos Silva" },
  { id: "V-002", modelo: "BMW 540i", placa: "DEF-5678", ano: 2023, status: "Em uso", motorista: "Ana Oliveira" },
  { id: "V-003", modelo: "Audi A6", placa: "GHI-9012", ano: 2024, status: "Manutenção", motorista: "-" },
  { id: "V-004", modelo: "Volvo S90", placa: "JKL-3456", ano: 2023, status: "Em uso", motorista: "Maria Costa" },
];

const statusColor: Record<string, string> = {
  "Disponível": "bg-emerald-100 text-emerald-700",
  "Em uso": "bg-blue-100 text-blue-700",
  "Manutenção": "bg-amber-100 text-amber-700",
};

export default function Veiculos() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground">Gestão da frota de veículos</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Novo Veículo</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {veiculos.map((v) => (
          <Card key={v.id} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{v.modelo}</CardTitle>
                  <p className="text-xs text-muted-foreground">{v.placa} · {v.ano}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[v.status]}`}>
                {v.status}
              </span>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Motorista: <span className="text-foreground font-medium">{v.motorista}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
