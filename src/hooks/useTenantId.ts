import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the current user's tenant_id for multi-tenancy data isolation.
 * All inserts to tenant-scoped tables should include this tenant_id.
 */
export function useTenantId() {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.tenant_id) setTenantId(data.tenant_id);
    };
    fetch();
  }, []);

  return tenantId;
}
