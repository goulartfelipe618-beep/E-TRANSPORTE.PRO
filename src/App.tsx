import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageProvider } from "@/contexts/PageContext";
import { TransferProvider } from "@/contexts/TransferContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PageProvider>
        <TransferProvider>
          <DashboardLayout />
        </TransferProvider>
      </PageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
