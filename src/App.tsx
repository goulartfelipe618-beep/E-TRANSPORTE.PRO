import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Transfer from "@/pages/Transfer";
import Motoristas from "@/pages/Motoristas";
import Veiculos from "@/pages/Veiculos";
import Campanhas from "@/pages/Campanhas";
import Marketing from "@/pages/Marketing";
import Network from "@/pages/Network";
import Sistema from "@/pages/Sistema";
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/motoristas" element={<Motoristas />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/campanhas" element={<Campanhas />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/network" element={<Network />} />
            <Route path="/sistema" element={<Sistema />} />
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
