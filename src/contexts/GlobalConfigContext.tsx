import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GlobalConfig {
  projectName: string;
  logoUrl: string;
  globalFont: string;
  isLoading: boolean;
  refetch: () => void;
}

const GlobalConfigContext = createContext<GlobalConfig>({
  projectName: "TransExec",
  logoUrl: "",
  globalFont: "Poppins",
  isLoading: true,
  refetch: () => {},
});

export function useGlobalConfig() {
  return useContext(GlobalConfigContext);
}

export function GlobalConfigProvider({ children }: { children: React.ReactNode }) {
  const [projectName, setProjectName] = useState("TransExec");
  const [logoUrl, setLogoUrl] = useState("");
  const [globalFont, setGlobalFont] = useState("Poppins");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase.from("system_settings").select("key, value");
    if (data) {
      data.forEach((row) => {
        if (row.key === "project_name" && row.value) setProjectName(row.value);
        if (row.key === "logo_url" && row.value) setLogoUrl(row.value);
        if (row.key === "global_font" && row.value) setGlobalFont(row.value);
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Apply global font to document
  useEffect(() => {
    if (globalFont) {
      // Load Google Font dynamically
      const linkId = "global-font-link";
      let link = document.getElementById(linkId) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${globalFont.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap`;
      document.documentElement.style.fontFamily = `"${globalFont}", sans-serif`;
    }
  }, [globalFont]);

  return (
    <GlobalConfigContext.Provider value={{ projectName, logoUrl, globalFont, mapProvider, mapApiKey, isLoading, refetch: fetchSettings }}>
      {children}
    </GlobalConfigContext.Provider>
  );
}
