import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageProvider } from "@/contexts/PageContext";
import { TransferProvider } from "@/contexts/TransferContext";
import { GlobalConfigProvider } from "@/contexts/GlobalConfigContext";
import { ProfileSetupDialog } from "@/components/ProfileSetupDialog";
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
  const [profileKey, setProfileKey] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(false);

      // If token refresh fails (user deleted), force logout
      if (_event === 'TOKEN_REFRESHED' && !session) {
        window.location.reload();
        return;
      }

      // Validate user still exists when session is present
      if (session) {
        const { error } = await supabase.auth.getUser();
        if (error) {
          await supabase.auth.signOut();
          window.location.reload();
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check role when session changes + realtime auto-logout
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

    // Realtime: auto-logout when user_role is deleted
    const channel = supabase
      .channel("user-role-watch")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "user_roles",
          filter: `user_id=eq.${session.user.id}`,
        },
        async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }
      )
      .subscribe();

    // Periodic session validation (every 30s) — catches deleted users
    const intervalId = setInterval(async () => {
      const { error } = await supabase.auth.getUser();
      if (error) {
        await supabase.auth.signOut();
        window.location.reload();
      }
    }, 30000);

    // Also check on tab focus
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        const { error } = await supabase.auth.getUser();
        if (error) {
          await supabase.auth.signOut();
          window.location.reload();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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
                  <ProfileSetupDialog
                    key={profileKey}
                    userId={session.user.id}
                    onComplete={() => setProfileKey((k) => k + 1)}
                  />
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
