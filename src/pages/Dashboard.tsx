import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, ArrowRightLeft, TrendingUp } from "lucide-react";

const stats = [
  { title: "Motoristas Ativos", value: "48", icon: Users, change: "+3 este mês" },
  { title: "Veículos na Frota", value: "32", icon: Car, change: "2 em manutenção" },
  { title: "Transfers Hoje", value: "18", icon: ArrowRightLeft, change: "+12% vs ontem" },
  { title: "Receita Mensal", value: "R$ 184.5k", icon: TrendingUp, change: "+8.2% vs mês anterior" },
];

const recentTransfers = [
  { id: "TR-001", motorista: "Carlos Silva", destino: "Aeroporto GRU", status: "Concluído", hora: "08:30" },
  { id: "TR-002", motorista: "Ana Oliveira", destino: "Hotel Fasano", status: "Em andamento", hora: "09:15" },
  { id: "TR-003", motorista: "Roberto Santos", destino: "Congonhas", status: "Agendado", hora: "10:00" },
  { id: "TR-004", motorista: "Maria Costa", destino: "Faria Lima", status: "Agendado", hora: "10:45" },
  { id: "TR-005", motorista: "Pedro Almeida", destino: "Aeroporto GRU", status: "Concluído", hora: "07:00" },
];

const statusColor: Record<string, string> = {
  "Concluído": "bg-emerald-100 text-emerald-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Agendado": "bg-amber-100 text-amber-700",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das operações</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Transfers Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Motorista</th>
                  <th className="pb-3 font-medium">Destino</th>
                  <th className="pb-3 font-medium">Hora</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransfers.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{t.id}</td>
                    <td className="py-3">{t.motorista}</td>
                    <td className="py-3">{t.destino}</td>
                    <td className="py-3">{t.hora}</td>
                    <td className="py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
