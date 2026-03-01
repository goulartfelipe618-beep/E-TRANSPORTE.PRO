import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

// Dashboard
import DashboardMetricas from "@/pages/dashboard/Metricas";
import DashboardAbrangencia from "@/pages/dashboard/Abrangencia";

// Transfer
import TransferSolicitacoes from "@/pages/transfer/Solicitacoes";
import TransferReservas from "@/pages/transfer/Reservas";
import TransferContrato from "@/pages/transfer/Contrato";
import TransferGeolocalizacao from "@/pages/transfer/Geolocalizacao";

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
import Marketing from "@/pages/Marketing";

// Network
import NetworkHoteis from "@/pages/network/Hoteis";
import NetworkAgencias from "@/pages/network/Agencias";
import NetworkClinicas from "@/pages/network/Clinicas";
import NetworkLaboratorios from "@/pages/network/Laboratorios";
import NetworkShows from "@/pages/network/Shows";
import NetworkCasamentos from "@/pages/network/Casamentos";
import NetworkEmbaixadas from "@/pages/network/Embaixadas";
import NetworkGoverno from "@/pages/network/Governo";

// Sistema
import SistemaConfiguracoes from "@/pages/sistema/Configuracoes";
import SistemaUsuarios from "@/pages/sistema/Usuarios";
import SistemaLogs from "@/pages/sistema/Logs";
import SistemaAplicativo from "@/pages/sistema/Aplicativo";
import SistemaTickets from "@/pages/sistema/Tickets";

// Outros
import Politicas from "@/pages/Politicas";
import Anotacoes from "@/pages/Anotacoes";
import Documentacao from "@/pages/Documentacao";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard/metricas" replace />} />
            <Route path="/dashboard/metricas" element={<DashboardMetricas />} />
            <Route path="/dashboard/abrangencia" element={<DashboardAbrangencia />} />

            {/* Transfer */}
            <Route path="/transfer/solicitacoes" element={<TransferSolicitacoes />} />
            <Route path="/transfer/reservas" element={<TransferReservas />} />
            <Route path="/transfer/contrato" element={<TransferContrato />} />
            <Route path="/transfer/geolocalizacao" element={<TransferGeolocalizacao />} />

            {/* Motoristas */}
            <Route path="/motoristas/cadastros" element={<MotoristasCadastros />} />
            <Route path="/motoristas/parcerias" element={<MotoristasParcerias />} />
            <Route path="/motoristas/solicitacoes" element={<MotoristasSolicitacoes />} />
            <Route path="/motoristas/agendamentos" element={<MotoristasAgendamentos />} />

            {/* Veículos */}
            <Route path="/veiculos" element={<Veiculos />} />

            {/* Campanhas */}
            <Route path="/campanhas/ativos" element={<CampanhasAtivos />} />
            <Route path="/campanhas/leads" element={<CampanhasLeads />} />

            {/* Marketing */}
            <Route path="/marketing" element={<Marketing />} />

            {/* Network */}
            <Route path="/network/hoteis" element={<NetworkHoteis />} />
            <Route path="/network/agencias" element={<NetworkAgencias />} />
            <Route path="/network/clinicas" element={<NetworkClinicas />} />
            <Route path="/network/laboratorios" element={<NetworkLaboratorios />} />
            <Route path="/network/shows" element={<NetworkShows />} />
            <Route path="/network/casamentos" element={<NetworkCasamentos />} />
            <Route path="/network/embaixadas" element={<NetworkEmbaixadas />} />
            <Route path="/network/governo" element={<NetworkGoverno />} />

            {/* Sistema */}
            <Route path="/sistema/configuracoes" element={<SistemaConfiguracoes />} />
            <Route path="/sistema/usuarios" element={<SistemaUsuarios />} />
            <Route path="/sistema/logs" element={<SistemaLogs />} />
            <Route path="/sistema/aplicativo" element={<SistemaAplicativo />} />
            <Route path="/sistema/tickets" element={<SistemaTickets />} />

            {/* Outros */}
            <Route path="/politicas" element={<Politicas />} />
            <Route path="/anotacoes" element={<Anotacoes />} />
            <Route path="/documentacao" element={<Documentacao />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
