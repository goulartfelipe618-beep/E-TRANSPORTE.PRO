import { createContext, useContext, useState, ReactNode } from "react";

export type PageKey =
  | "dashboard/metricas"
  | "dashboard/abrangencia"
  | "transfer/solicitacoes"
  | "transfer/reservas"
  | "transfer/contrato"
  | "transfer/geolocalizacao"
  | "transfer/automacao"
  | "motoristas/cadastros"
  | "motoristas/parcerias"
  | "motoristas/solicitacoes"
  | "motoristas/agendamentos"
  | "veiculos"
  | "campanhas/ativos"
  | "campanhas/leads"
  | "marketing"
  | "network/hoteis"
  | "network/agencias"
  | "network/clinicas"
  | "network/laboratorios"
  | "network/shows"
  | "network/casamentos"
  | "network/embaixadas"
  | "network/governo"
  | "sistema/configuracoes"
  | "sistema/usuarios"
  | "sistema/logs"
  | "sistema/aplicativo"
  | "sistema/tickets"
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
