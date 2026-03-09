import { createContext, useContext, useState, ReactNode } from "react";

export type PageKey =
  | "home"
  | "dashboard/metricas"
  | "dashboard/abrangencia"
  | "transfer/solicitacoes"
  | "transfer/reservas"
  | "transfer/contrato"
  | "transfer/geolocalizacao"
  | "grupos/solicitacoes"
  | "grupos/reservas"
  | "grupos/contrato"
  | "motoristas/cadastros"
  | "motoristas/parcerias"
  | "motoristas/solicitacoes"
  | "motoristas/agendamentos"
  | "veiculos"
  | "campanhas/ativos"
  | "campanhas/leads"
  | "marketing/receptivos"
  | "marketing/qrcode"
  | "network"
  | "google"
  | "email-business"
  | "sistema/configuracoes"
  | "sistema/usuarios"
  | "sistema/logs"
  | "sistema/aplicativo"
  | "sistema/tickets"
  | "sistema/automacoes"
  | "sistema/comunicador"
  | "politicas"
  | "anotacoes"
  | "documentacao"
  | "website"
  | "dominios"
  | "taxi/solicitacoes";

interface PageContextType {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
}

const PageContext = createContext<PageContextType>({
  activePage: "home",
  setActivePage: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageKey>("home");
  return (
    <PageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </PageContext.Provider>
  );
}

export function useActivePage() {
  return useContext(PageContext);
}
