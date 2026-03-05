import { useActivePage, PageKey } from "@/contexts/PageContext";

// Dashboard
import DashboardMetricas from "@/pages/dashboard/Metricas";
import DashboardAbrangencia from "@/pages/dashboard/Abrangencia";
// Transfer
import TransferSolicitacoes from "@/pages/transfer/Solicitacoes";
import TransferReservas from "@/pages/transfer/Reservas";
import TransferContrato from "@/pages/transfer/Contrato";
import TransferGeolocalizacao from "@/pages/transfer/Geolocalizacao";
// Grupos
import GruposSolicitacoes from "@/pages/grupos/Solicitacoes";
import GruposReservas from "@/pages/grupos/Reservas";
import GruposContrato from "@/pages/grupos/Contrato";
// Motoristas
import MotoristasCadastros from "@/pages/motoristas/Cadastros";
import MotoristasParcerias from "@/pages/motoristas/Parcerias";
import MotoristasSolicitacoes from "@/pages/motoristas/Solicitacoes";
import MotoristasAgendamentos from "@/pages/motoristas/Agendamentos";
// Veiculos
import Veiculos from "@/pages/Veiculos";
// Campanhas
import CampanhasAtivos from "@/pages/campanhas/Ativos";
import CampanhasLeads from "@/pages/campanhas/Leads";
// Marketing
import MarketingEmails from "@/pages/marketing/Emails";
import MarketingReceptivos from "@/pages/marketing/Receptivos";
import MarketingQrCode from "@/pages/marketing/QrCode";
// Network
import NetworkPage from "@/pages/Network";
// Google
import GoogleBusiness from "@/pages/GoogleBusiness";
// Email Business
import EmailBusiness from "@/pages/EmailBusiness";
// Sistema
import SistemaConfiguracoes from "@/pages/sistema/Configuracoes";
import SistemaUsuarios from "@/pages/sistema/Usuarios";
import SistemaLogs from "@/pages/sistema/Logs";
import SistemaAplicativo from "@/pages/sistema/Aplicativo";
import SistemaTickets from "@/pages/sistema/Tickets";
import SistemaAutomacoes from "@/pages/sistema/Automacoes";
import SistemaComunicador from "@/pages/sistema/Comunicador";
// Outros
import Politicas from "@/pages/Politicas";
import Anotacoes from "@/pages/Anotacoes";
import Documentacao from "@/pages/Documentacao";
import WebsitePage from "@/pages/Website";

const pageMap: Record<PageKey, React.ComponentType> = {
  "dashboard/metricas": DashboardMetricas,
  "dashboard/abrangencia": DashboardAbrangencia,
  "transfer/solicitacoes": TransferSolicitacoes,
  "transfer/reservas": TransferReservas,
  "transfer/contrato": TransferContrato,
  "transfer/geolocalizacao": TransferGeolocalizacao,
  "grupos/solicitacoes": GruposSolicitacoes,
  "grupos/reservas": GruposReservas,
  "grupos/contrato": GruposContrato,
  "motoristas/cadastros": MotoristasCadastros,
  "motoristas/parcerias": MotoristasParcerias,
  "motoristas/solicitacoes": MotoristasSolicitacoes,
  "motoristas/agendamentos": MotoristasAgendamentos,
  "veiculos": Veiculos,
  "campanhas/ativos": CampanhasAtivos,
  "campanhas/leads": CampanhasLeads,
  "marketing/emails": MarketingEmails,
  "marketing/receptivos": MarketingReceptivos,
  "marketing/qrcode": MarketingQrCode,
  "network": NetworkPage,
  "google": GoogleBusiness,
  "email-business": EmailBusiness,
  "sistema/configuracoes": SistemaConfiguracoes,
  "sistema/usuarios": SistemaUsuarios,
  "sistema/logs": SistemaLogs,
  "sistema/aplicativo": SistemaAplicativo,
  "sistema/tickets": SistemaTickets,
  "sistema/automacoes": SistemaAutomacoes,
  "sistema/comunicador": SistemaComunicador,
  "politicas": Politicas,
  "anotacoes": Anotacoes,
  "documentacao": Documentacao,
  "website": WebsitePage,
};

export function PageRenderer() {
  const { activePage } = useActivePage();
  const Component = pageMap[activePage];
  return <Component />;
}
