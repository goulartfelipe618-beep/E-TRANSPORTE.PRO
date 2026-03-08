import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "./useTenantId";

/**
 * Returns the set of enabled menu keys for the current tenant.
 * If no config exists, all menus are enabled by default.
 */
export function useTenantMenus() {
  const tenantId = useTenantId();
  const [enabledMenus, setEnabledMenus] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from("tenant_menu_config")
        .select("menu_key, enabled")
        .eq("tenant_id", tenantId);

      if (error || !data || data.length === 0) {
        // No config = all enabled
        setEnabledMenus(null);
      } else {
        const enabled = new Set<string>();
        data.forEach((row) => {
          if (row.enabled) enabled.add(row.menu_key);
        });
        setEnabledMenus(enabled);
      }
      setLoading(false);
    };

    fetchMenus();
  }, [tenantId]);

  /**
   * Check if a menu key is allowed.
   * Menu keys use dots: "dashboard.metricas"
   * If no config exists (enabledMenus is null), everything is allowed.
   */
  // Essential menus always enabled
  const ESSENTIAL_KEYS = new Set(["painel", "painel.home", "home"]);

  const isMenuEnabled = (menuKey: string): boolean => {
    if (ESSENTIAL_KEYS.has(menuKey)) return true;
    if (enabledMenus === null) return true;
    // Direct match
    if (enabledMenus.has(menuKey)) return true;
    // If this is a sub-key (e.g. "marketing.qrcode"), check if parent ("marketing") is enabled
    // and the sub-key itself has no explicit entry (implicit allow from parent)
    const dotIdx = menuKey.indexOf(".");
    if (dotIdx > 0) {
      const parent = menuKey.substring(0, dotIdx);
      // If the parent is enabled and there's no explicit entry for this sub-key, allow it
      if (enabledMenus.has(parent) && !enabledMenus.has(menuKey)) {
        // Check if ANY sub-key of this parent exists in config — if not, all subs are implicitly allowed
        const hasExplicitSubs = Array.from(enabledMenus).some((k) => k.startsWith(parent + "."));
        if (!hasExplicitSubs) return true;
      }
    }
    return false;
  };

  return { isMenuEnabled, loading };
}
