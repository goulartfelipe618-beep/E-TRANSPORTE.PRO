import { useState } from "react";
import {
  LayoutDashboard, Users, Building2, Menu as MenuIcon, Settings2,
  ListChecks, ScrollText, KeyRound, LogOut, ChevronLeft, ChevronRight, Layers3, Shield,
  Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanelTheme } from "@/hooks/usePanelTheme";
import MasterDashboard from "./MasterDashboard";
import MasterTenants from "./MasterTenants";
import MasterUsers from "./MasterUsers";
import MasterMenus from "./MasterMenus";
import MasterCategories from "./MasterCategories";
import MasterLogs from "./MasterLogs";
import MasterApiConfig from "./MasterApiConfig";
import MasterSecurity from "./MasterSecurity";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tenants", label: "Tenants", icon: Building2 },
  { key: "users", label: "Usuários", icon: Users },
  { key: "menus", label: "Menus / Permissões", icon: MenuIcon },
  { key: "categories", label: "Categorias de Automação", icon: Layers3 },
  { key: "logs", label: "Logs", icon: ScrollText },
  { key: "apis", label: "APIs & Configurações", icon: KeyRound },
  { key: "security", label: "Segurança", icon: Shield },
];

export default function MasterLayout() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggle: toggleTheme } = usePanelTheme("master-theme");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <MasterDashboard />;
      case "tenants": return <MasterTenants />;
      case "users": return <MasterUsers />;
      case "menus": return <MasterMenus />;
      case "categories": return <MasterCategories />;
      case "logs": return <MasterLogs />;
      case "apis": return <MasterApiConfig />;
      case "security": return <MasterSecurity />;
      default: return <MasterDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col bg-card border-r transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center gap-2 p-4 border-b">
          <Settings2 className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && <span className="font-bold text-lg text-foreground">Master Admin</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active === item.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Recolher</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}
