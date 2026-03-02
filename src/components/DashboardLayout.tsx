import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageRenderer } from "@/components/PageRenderer";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";

export function DashboardLayout() {
  const { projectName, logoUrl } = useGlobalConfig();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-4">
            <SidebarTrigger />
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain" />}
            <h1 className="text-sm font-semibold text-foreground">{projectName} — Gestão de Frota</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <PageRenderer />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
