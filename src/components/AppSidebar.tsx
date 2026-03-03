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

interface SubItem {
  title: string;
  page: PageKey;
  icon: React.ElementType;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  page?: PageKey;
  subItems?: SubItem[];
}

const menuSections: { label: string; items: MenuItem[] }[] = [
  {
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        subItems: [
          { title: "Métricas", page: "dashboard/metricas", icon: Activity },
          { title: "Abrangência", page: "dashboard/abrangencia", icon: MapPin },
        ],
      },
      {
        title: "Transfer",
        icon: ArrowRightLeft,
        subItems: [
          { title: "Solicitações", page: "transfer/solicitacoes", icon: ClipboardList },
          { title: "Reservas", page: "transfer/reservas", icon: CalendarCheck },
          { title: "Contrato", page: "transfer/contrato", icon: BookOpen },
          { title: "Geolocalização", page: "transfer/geolocalizacao", icon: MapPinned },
        ],
      },
      {
        title: "Grupos",
        icon: Bus,
        subItems: [
          { title: "Solicitações", page: "grupos/solicitacoes" as PageKey, icon: ClipboardList },
          { title: "Reservas", page: "grupos/reservas" as PageKey, icon: CalendarCheck },
          { title: "Contrato", page: "grupos/contrato" as PageKey, icon: BookOpen },
        ],
      },
      {
        title: "Motoristas",
        icon: Users,
        subItems: [
          { title: "Cadastros", page: "motoristas/cadastros", icon: UserPlus },
          { title: "Parcerias", page: "motoristas/parcerias", icon: Handshake },
          { title: "Solicitações", page: "motoristas/solicitacoes", icon: ClipboardList },
          { title: "Agendamentos", page: "motoristas/agendamentos", icon: Calendar },
        ],
      },
      { title: "Veículos", icon: Car, page: "veiculos" },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Campanhas",
        icon: Megaphone,
        subItems: [
          { title: "Ativos", page: "campanhas/ativos", icon: Target },
          { title: "Leads", page: "campanhas/leads", icon: UserCheck },
        ],
      },
      { title: "Marketing", icon: BarChart3, page: "marketing" },
      {
        title: "Network",
        icon: Globe,
        subItems: [
          { title: "Hotéis e Resorts", page: "network/hoteis", icon: Hotel },
          { title: "Agências de Viagens", page: "network/agencias", icon: Plane },
          { title: "Clínicas e Hospitais", page: "network/clinicas", icon: Building2 },
          { title: "Laboratórios e Farmácias", page: "network/laboratorios", icon: FlaskConical },
          { title: "Produtores de Shows", page: "network/shows", icon: Music },
          { title: "Empresas de Casamento", page: "network/casamentos", icon: Heart },
          { title: "Embaixadas e Consulados", page: "network/embaixadas", icon: Landmark },
          { title: "Órgãos Governamentais", page: "network/governo", icon: Building },
        ],
      },
    ],
  },
  {
    label: "Configurações",
    items: [
      {
        title: "Sistema",
        icon: Settings,
        subItems: [
          { title: "Configurações", page: "sistema/configuracoes", icon: Cog },
          { title: "Automações", page: "sistema/automacoes", icon: Cog },
          { title: "Comunicador", page: "sistema/comunicador", icon: MessageSquare },
          { title: "Usuários", page: "sistema/usuarios", icon: UsersRound },
          { title: "Logs", page: "sistema/logs", icon: ScrollText },
          { title: "Aplicativo", page: "sistema/aplicativo", icon: Smartphone },
          { title: "Tickets", page: "sistema/tickets", icon: Ticket },
        ],
      },
      { title: "Políticas", icon: Shield, page: "politicas" },
      { title: "Anotações", icon: StickyNote, page: "anotacoes" },
      { title: "Documentação", icon: FileText, page: "documentacao" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { activePage, setActivePage } = useActivePage();
  const { projectName, logoUrl } = useGlobalConfig();

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
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  item.subItems ? (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isSubActive(item.subItems)}
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
                              {item.subItems.map((sub) => (
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
                  ) : (
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
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <div className="mt-auto p-3 border-t border-sidebar-accent">
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
