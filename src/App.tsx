import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageProvider } from "@/contexts/PageContext";
import { TransferProvider } from "@/contexts/TransferContext";
import { GlobalConfigProvider } from "@/contexts/GlobalConfigContext";
import { supabase } from "@/integrations/supabase/client";
import Login from "@/pages/Login";
import MasterLayout from "@/pages/master/MasterLayout";
import type { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaster, setIsMaster] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check role when session changes
  useEffect(() => {
    if (!session?.user) {
      setIsMaster(false);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsMaster(data?.role === "master_admin");
        setRoleLoading(false);
      });
  }, [session?.user?.id]);

  if (loading || (session && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {session ? (
          isMaster ? (
            <MasterLayout />
          ) : (
            <GlobalConfigProvider>
              <PageProvider>
                <TransferProvider>
                  <DashboardLayout />
                </TransferProvider>
              </PageProvider>
            </GlobalConfigProvider>
          )
        ) : (
          <Login />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
