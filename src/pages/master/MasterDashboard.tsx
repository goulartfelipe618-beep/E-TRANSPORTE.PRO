import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Layers3, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MasterDashboard() {
  const [stats, setStats] = useState({ tenants: 0, users: 0, categories: 0, logsToday: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [t, u, c, l] = await Promise.all([
        supabase.from("tenants").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }),
        supabase.from("automation_categories").select("id", { count: "exact", head: true }),
        supabase.from("system_logs").select("id", { count: "exact", head: true })
          .gte("created_at", new Date().toISOString().split("T")[0]),
      ]);
      setStats({
        tenants: t.count ?? 0,
        users: u.count ?? 0,
        categories: c.count ?? 0,
        logsToday: l.count ?? 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { label: "Tenants", value: stats.tenants, icon: Building2, color: "text-blue-500" },
    { label: "Usuários", value: stats.users, icon: Users, color: "text-emerald-500" },
    { label: "Categorias", value: stats.categories, icon: Layers3, color: "text-amber-500" },
    { label: "Logs Hoje", value: stats.logsToday, icon: ScrollText, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel Master</h1>
        <p className="text-muted-foreground">Visão geral do sistema white-label.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={cn("h-5 w-5", c.color)} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) { return classes.filter(Boolean).join(" "); }
