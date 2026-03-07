import { useState } from "react";
import {
  LayoutDashboard, Users, Building2, Menu as MenuIcon, Settings2,
  ListChecks, ScrollText, KeyRound, LogOut, ChevronLeft, ChevronRight, Layers3, Shield,
  Sun, Moon, Globe, StickyNote, X, MessageSquare, LayoutTemplate, Phone,
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
import MasterDeveloper from "./MasterDeveloper";
import MasterNetworkCategories from "./MasterNetworkCategories";
import MasterWebsites from "./MasterWebsites";
import MasterWebsiteTemplates from "./MasterWebsiteTemplates";
import MasterAnotacoes from "./MasterAnotacoes";
import MasterComunicadorRequests from "./MasterComunicadorRequests";
import MasterDominios from "./MasterDominios";
import MasterComunicador from "./MasterComunicador";
import MasterSlides from "./MasterSlides";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tenants", label: "Tenants", icon: Building2 },
  { key: "users", label: "Usuários", icon: Users },
  { key: "comunicador_requests", label: "Sol. Comunicadores", icon: MessageSquare },
  { key: "comunicador_master", label: "Comunicador", icon: Phone },
  { key: "menus", label: "Menus / Permissões", icon: MenuIcon },
  { key: "categories", label: "Cat. Automação", icon: Layers3 },
  { key: "network_categories", label: "Cat. Network", icon: Settings2 },
  { key: "developer", label: "Desenvolvedor", icon: ListChecks },
  { key: "logs", label: "Logs", icon: ScrollText },
  { key: "apis", label: "APIs & Config", icon: KeyRound },
  { key: "security", label: "Segurança", icon: Shield },
  { key: "website_templates", label: "Modelos Website", icon: LayoutTemplate },
  { key: "websites", label: "Sol. Websites", icon: Globe },
  { key: "dominios", label: "Sol. Domínio", icon: Globe },
  { key: "anotacoes", label: "Anotações", icon: StickyNote },
];

export default function MasterLayout() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle: toggleTheme } = usePanelTheme("master-theme");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleMenuClick = (key: string) => {
    setActive(key);
    setMobileOpen(false);
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <MasterDashboard />;
      case "tenants": return <MasterTenants />;
      case "users": return <MasterUsers />;
      case "menus": return <MasterMenus />;
      case "categories": return <MasterCategories />;
      case "network_categories": return <MasterNetworkCategories />;
      case "developer": return <MasterDeveloper />;
      case "logs": return <MasterLogs />;
      case "apis": return <MasterApiConfig />;
      case "security": return <MasterSecurity />;
      case "websites": return <MasterWebsites />;
      case "dominios": return <MasterDominios />;
      case "website_templates": return <MasterWebsiteTemplates />;
      case "anotacoes": return <MasterAnotacoes />;
      case "comunicador_requests": return <MasterComunicadorRequests />;
      case "comunicador_master": return <MasterComunicador />;
      default: return <MasterDashboard />;
    }
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 p-4 border-b shrink-0">
        <Settings2 className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && <span className="font-bold text-lg text-foreground truncate">Master Admin</span>}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto md:hidden p-1 rounded hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleMenuClick(item.key)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active === item.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t space-y-1 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full hidden md:flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/30 overflow-x-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300 shrink-0 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Sidebar - mobile drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r w-72 transform transition-transform duration-300 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 flex items-center border-b bg-card px-3 gap-3 md:hidden shrink-0 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted">
            <MenuIcon className="h-5 w-5" />
          </button>
          <Settings2 className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm text-foreground truncate">Master Admin</span>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
