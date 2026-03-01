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
  Building,
  Cog,
  UsersRound,
  ScrollText,
  Smartphone,
  Ticket,
  MapPinned,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

interface SubItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  url?: string;
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
          { title: "Métricas", url: "/dashboard/metricas", icon: Activity },
          { title: "Abrangência", url: "/dashboard/abrangencia", icon: MapPin },
        ],
      },
      {
        title: "Transfer",
        icon: ArrowRightLeft,
        subItems: [
          { title: "Solicitações", url: "/transfer/solicitacoes", icon: ClipboardList },
          { title: "Reservas", url: "/transfer/reservas", icon: CalendarCheck },
          { title: "Contrato", url: "/transfer/contrato", icon: BookOpen },
          { title: "Geolocalização", url: "/transfer/geolocalizacao", icon: MapPinned },
        ],
      },
      {
        title: "Motoristas",
        icon: Users,
        subItems: [
          { title: "Cadastros", url: "/motoristas/cadastros", icon: UserPlus },
          { title: "Parcerias", url: "/motoristas/parcerias", icon: Handshake },
          { title: "Solicitações", url: "/motoristas/solicitacoes", icon: ClipboardList },
          { title: "Agendamentos", url: "/motoristas/agendamentos", icon: Calendar },
        ],
      },
      { title: "Veículos", icon: Car, url: "/veiculos" },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Campanhas",
        icon: Megaphone,
        subItems: [
          { title: "Ativos", url: "/campanhas/ativos", icon: Target },
          { title: "Leads", url: "/campanhas/leads", icon: UserCheck },
        ],
      },
      { title: "Marketing", icon: BarChart3, url: "/marketing" },
      {
        title: "Network",
        icon: Globe,
        subItems: [
          { title: "Hotéis e Resorts", url: "/network/hoteis", icon: Hotel },
          { title: "Agências de Viagens", url: "/network/agencias", icon: Plane },
          { title: "Clínicas e Hospitais", url: "/network/clinicas", icon: Building2 },
          { title: "Laboratórios e Farmácias", url: "/network/laboratorios", icon: FlaskConical },
          { title: "Produtores de Shows", url: "/network/shows", icon: Music },
          { title: "Empresas de Casamento", url: "/network/casamentos", icon: Heart },
          { title: "Embaixadas e Consulados", url: "/network/embaixadas", icon: Landmark },
          { title: "Órgãos Governamentais", url: "/network/governo", icon: Building },
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
          { title: "Configurações", url: "/sistema/configuracoes", icon: Cog },
          { title: "Usuários", url: "/sistema/usuarios", icon: UsersRound },
          { title: "Logs", url: "/sistema/logs", icon: ScrollText },
          { title: "Aplicativo", url: "/sistema/aplicativo", icon: Smartphone },
          { title: "Tickets", url: "/sistema/tickets", icon: Ticket },
        ],
      },
      { title: "Políticas", icon: Shield, url: "/politicas" },
      { title: "Anotações", icon: StickyNote, url: "/anotacoes" },
      { title: "Documentação", icon: FileText, url: "/documentacao" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isSubActive = (subItems?: SubItem[]) =>
    subItems?.some((s) => location.pathname.startsWith(s.url)) ?? false;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
              TE
            </div>
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground">TransExec</h2>
              <p className="text-[10px] text-sidebar-foreground/60">Transporte Executivo</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm mx-auto">
            TE
          </div>
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
                                <SidebarMenuItem key={sub.url}>
                                  <SidebarMenuButton asChild>
                                    <NavLink
                                      to={sub.url}
                                      className="hover:bg-sidebar-accent/50 text-sm"
                                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                                    >
                                      <sub.icon className="h-3.5 w-3.5" />
                                      <span>{sub.title}</span>
                                    </NavLink>
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
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url!}
                          end={item.url === "/"}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
