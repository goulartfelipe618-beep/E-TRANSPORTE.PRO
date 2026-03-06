import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageRenderer } from "@/components/PageRenderer";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { AIChatWidget } from "@/components/AIChatWidget";

export function DashboardLayout() {
  const { projectName, logoUrl } = useGlobalConfig();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-3 sm:px-4 gap-3 shrink-0 sticky top-0 z-30">
            <SidebarTrigger />
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain shrink-0" />}
            <h1 className="text-sm font-semibold text-foreground truncate">{projectName} — Gestão de Frota</h1>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto">
            <PageRenderer />
          </main>
        </div>
        <AIChatWidget />
      </div>
    </SidebarProvider>
  );
}
