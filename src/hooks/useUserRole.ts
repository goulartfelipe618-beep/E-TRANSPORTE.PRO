import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "master_admin" | "admin" | "user";

interface UserRoleData {
  role: AppRole | null;
  tenantId: string | null;
  isLoading: boolean;
  isMaster: boolean;
}

export function useUserRole(): UserRoleData {
  const [role, setRole] = useState<AppRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Use getSession instead of getUser to avoid lock contention
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setIsLoading(false); return; }

      const { data } = await supabase
        .from("user_roles")
        .select("role, tenant_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setRole(data.role as AppRole);
        setTenantId(data.tenant_id);
      }
      setIsLoading(false);
    };
    fetch();
  }, []);

  return { role, tenantId, isLoading, isMaster: role === "master_admin" };
}
