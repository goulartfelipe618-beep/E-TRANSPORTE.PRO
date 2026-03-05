import { createContext, useContext, useState, ReactNode } from "react";

export type PageKey =
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
  | "marketing/emails"
  | "marketing/receptivos"
  | "marketing/qrcode"
  | "network"
  | "google"
  | "sistema/configuracoes"
  | "sistema/usuarios"
  | "sistema/logs"
  | "sistema/aplicativo"
  | "sistema/tickets"
  | "sistema/automacoes"
  | "sistema/comunicador"
  | "politicas"
  | "anotacoes"
  | "documentacao";

interface PageContextType {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
}

const PageContext = createContext<PageContextType>({
  activePage: "dashboard/metricas",
  setActivePage: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageKey>("dashboard/metricas");
  return (
    <PageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </PageContext.Provider>
  );
}

export function useActivePage() {
  return useContext(PageContext);
}
