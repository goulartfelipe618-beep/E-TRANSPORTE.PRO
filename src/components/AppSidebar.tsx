import {
  LayoutDashboard,
  ArrowRightLeft,
  Users,
  Car,
  Megaphone,
  BarChart3,
  Globe,
  Settings,
  Shield,
  StickyNote,
  FileText,
  ChevronDown,
  Activity,
  MapPin,
  ClipboardList,
  CalendarCheck,
  BookOpen,
  Handshake,
  UserPlus,
  Calendar,
  Target,
  UserCheck,
  Hotel,
  Plane,
  Building2,
  FlaskConical,
  Music,
  Heart,
  Landmark,
  LogOut,
  Building,
  Cog,
  UsersRound,
  ScrollText,
  Smartphone,
  Ticket,
  MapPinned,
  MessageSquare,
  Bus,
  Sun,
  Moon,
  Mail,
  QrCode,
} from "lucide-react";
import { useActivePage, PageKey } from "@/contexts/PageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { useTenantMenus } from "@/hooks/useTenantMenus";
import { usePanelTheme } from "@/hooks/usePanelTheme";
import { NotificationBell } from "@/components/NotificationBell";


interface SubItem {
  title: string;
  page: PageKey;
  icon: React.ElementType;
  menuKey: string;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  page?: PageKey;
  menuKey: string;
  subItems?: SubItem[];
}

const menuSections: { label: string; items: MenuItem[] }[] = [
  {
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        menuKey: "dashboard",
        subItems: [
          { title: "Métricas", page: "dashboard/metricas", icon: Activity, menuKey: "dashboard.metricas" },
          { title: "Abrangência", page: "dashboard/abrangencia", icon: MapPin, menuKey: "dashboard.abrangencia" },
        ],
      },
      {
        title: "Transfer",
        icon: ArrowRightLeft,
        menuKey: "transfer",
        subItems: [
          { title: "Solicitações", page: "transfer/solicitacoes", icon: ClipboardList, menuKey: "transfer.solicitacoes" },
          { title: "Reservas", page: "transfer/reservas", icon: CalendarCheck, menuKey: "transfer.reservas" },
          { title: "Contrato", page: "transfer/contrato", icon: BookOpen, menuKey: "transfer.contrato" },
          { title: "Geolocalização", page: "transfer/geolocalizacao", icon: MapPinned, menuKey: "transfer.geolocalizacao" },
        ],
      },
      {
        title: "Grupos",
        icon: Bus,
        menuKey: "grupos",
        subItems: [
          { title: "Solicitações", page: "grupos/solicitacoes" as PageKey, icon: ClipboardList, menuKey: "grupos.solicitacoes" },
          { title: "Reservas", page: "grupos/reservas" as PageKey, icon: CalendarCheck, menuKey: "grupos.reservas" },
          { title: "Contrato", page: "grupos/contrato" as PageKey, icon: BookOpen, menuKey: "grupos.contrato" },
        ],
      },
      {
        title: "Motoristas",
        icon: Users,
        menuKey: "motoristas",
        subItems: [
          { title: "Cadastros", page: "motoristas/cadastros", icon: UserPlus, menuKey: "motoristas.cadastros" },
          { title: "Parcerias", page: "motoristas/parcerias", icon: Handshake, menuKey: "motoristas.parcerias" },
          { title: "Solicitações", page: "motoristas/solicitacoes", icon: ClipboardList, menuKey: "motoristas.solicitacoes" },
          { title: "Agendamentos", page: "motoristas/agendamentos", icon: Calendar, menuKey: "motoristas.agendamentos" },
        ],
      },
      { title: "Veículos", icon: Car, page: "veiculos", menuKey: "veiculos" },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Campanhas",
        icon: Megaphone,
        menuKey: "campanhas",
        subItems: [
          { title: "Ativos", page: "campanhas/ativos", icon: Target, menuKey: "campanhas.ativos" },
          { title: "Leads", page: "campanhas/leads", icon: UserCheck, menuKey: "campanhas.leads" },
        ],
      },
      {
        title: "Marketing",
        icon: BarChart3,
        menuKey: "marketing",
        subItems: [
          { title: "E-mails", page: "marketing/emails" as PageKey, icon: Mail, menuKey: "marketing.emails" },
          { title: "Receptivos", page: "marketing/receptivos" as PageKey, icon: MapPin, menuKey: "marketing.receptivos" },
          { title: "QR Code", page: "marketing/qrcode" as PageKey, icon: QrCode, menuKey: "marketing.qrcode" },
        ],
      },
      {
        title: "Network",
        icon: Globe,
        page: "network" as PageKey,
        menuKey: "network",
      },
    ],
  },
  {
    label: "Configurações",
    items: [
      {
        title: "Sistema",
        icon: Settings,
        menuKey: "sistema",
        subItems: [
          { title: "Configurações", page: "sistema/configuracoes", icon: Cog, menuKey: "sistema.configuracoes" },
          { title: "Automações", page: "sistema/automacoes", icon: Cog, menuKey: "sistema.automacoes" },
          { title: "Comunicador", page: "sistema/comunicador", icon: MessageSquare, menuKey: "sistema.comunicador" },
          { title: "Usuários", page: "sistema/usuarios", icon: UsersRound, menuKey: "sistema.usuarios" },
          { title: "Logs", page: "sistema/logs", icon: ScrollText, menuKey: "sistema.logs" },
          { title: "Aplicativo", page: "sistema/aplicativo", icon: Smartphone, menuKey: "sistema.aplicativo" },
          { title: "Tickets", page: "sistema/tickets", icon: Ticket, menuKey: "sistema.tickets" },
        ],
      },
      { title: "Anotações", icon: StickyNote, page: "anotacoes", menuKey: "anotacoes" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { activePage, setActivePage } = useActivePage();
  const { projectName, logoUrl } = useGlobalConfig();
  const { isMenuEnabled } = useTenantMenus();
  const { isDark, toggle: toggleTheme } = usePanelTheme("admin-theme");

  const isSubActive = (subItems?: SubItem[]) =>
    subItems?.some((s) => s.page === activePage) ?? false;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                {projectName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground">{projectName}</h2>
              <p className="text-[10px] text-sidebar-foreground/60">Gestão de Frota</p>
            </div>
          </div>
        ) : (
          logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-contain mx-auto" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm mx-auto">
              {projectName.substring(0, 2).toUpperCase()}
            </div>
          )
        )}
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => {
          const visibleItems = section.items.filter((item) => isMenuEnabled(item.menuKey));
          if (visibleItems.length === 0) return null;
          return (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  if (item.subItems) {
                    const visibleSubs = item.subItems.filter((sub) => isMenuEnabled(sub.menuKey));
                    if (visibleSubs.length === 0) return null;
                    return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isSubActive(visibleSubs)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="hover:bg-sidebar-accent/50">
                            <item.icon className="h-4 w-4" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenu className="ml-4 border-l border-sidebar-border pl-2 mt-1">
                              {visibleSubs.map((sub) => (
                                <SidebarMenuItem key={sub.page}>
                                  <SidebarMenuButton
                                    onClick={() => setActivePage(sub.page)}
                                    className={cn(
                                      "hover:bg-sidebar-accent/50 text-sm cursor-pointer",
                                      activePage === sub.page && "bg-sidebar-accent text-sidebar-primary font-medium"
                                    )}
                                  >
                                    <sub.icon className="h-3.5 w-3.5" />
                                    <span>{sub.title}</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                    );
                  }
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setActivePage(item.page!)}
                        className={cn(
                          "hover:bg-sidebar-accent/50 cursor-pointer",
                          activePage === item.page && "bg-sidebar-accent text-sidebar-primary font-medium"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          );
        })}
      </SidebarContent>
      <div className="mt-auto p-3 border-t border-sidebar-accent space-y-1">
        <NotificationBell collapsed={collapsed} />
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
        <button
          onClick={async () => {
            const { supabase } = await import("@/integrations/supabase/client");
            await supabase.auth.signOut();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </Sidebar>
  );
}
