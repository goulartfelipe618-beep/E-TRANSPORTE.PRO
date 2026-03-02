import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((row) => {
        map[row.key] = row.value ?? "";
      });
      return map;
    },
  });

  const upsert = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Try update first, then insert
      const { data: existing } = await supabase
        .from("system_settings")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("system_settings")
          .update({ value })
          .eq("key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_settings")
          .insert({ key, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });

  return { settings, isLoading, upsert };
}
