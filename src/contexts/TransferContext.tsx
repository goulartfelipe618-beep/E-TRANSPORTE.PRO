import { createContext, useContext, useState, ReactNode } from "react";

export interface Solicitacao {
  id: string;
  data: string;
  cliente: string;
  tipo: string;
  embarque: string;
  desembarque: string;
  dataHora: string;
  qtdPax: number;
  status: "pendente" | "convertida" | "cancelada";
  telefone?: string;
  email?: string;
  observacoes?: string;
}

export interface Reserva {
  id: string;
  solicitacaoId: string;
  data: string;
  cliente: string;
  tipo: string;
  embarque: string;
  desembarque: string;
  dataHora: string;
  qtdPax: number;
  status: "confirmada" | "em_andamento" | "concluida" | "cancelada";
  telefone?: string;
  email?: string;
  observacoes?: string;
  criadoEm: string;
}

const mockSolicitacoes: Solicitacao[] = [
  {
    id: "SOL-001",
    data: "2026-02-28",
    cliente: "João Silva",
    tipo: "Aeroporto",
    embarque: "Hotel Fasano - Ipanema",
    desembarque: "Aeroporto GIG - Terminal 2",
    dataHora: "2026-03-05 08:00",
    qtdPax: 2,
    status: "pendente",
    telefone: "(21) 99999-1234",
    email: "joao@email.com",
    observacoes: "Necessita cadeirinha infantil",
  },
  {
    id: "SOL-002",
    data: "2026-02-27",
    cliente: "Maria Oliveira",
    tipo: "Ponto a Ponto",
    embarque: "Av. Atlântica, 1500 - Copacabana",
    desembarque: "Barra Shopping - Barra da Tijuca",
    dataHora: "2026-03-03 14:30",
    qtdPax: 1,
    status: "pendente",
    telefone: "(21) 98888-5678",
    email: "maria@email.com",
  },
  {
    id: "SOL-003",
    data: "2026-02-26",
    cliente: "Carlos Mendes",
    tipo: "Evento",
    embarque: "Rua Voluntários da Pátria, 200 - Botafogo",
    desembarque: "Jeunesse Arena - Barra da Tijuca",
    dataHora: "2026-03-10 19:00",
    qtdPax: 4,
    status: "pendente",
    telefone: "(21) 97777-9012",
    email: "carlos@empresa.com",
    observacoes: "Grupo corporativo, necessita van executiva",
  },
  {
    id: "SOL-004",
    data: "2026-02-25",
    cliente: "Ana Costa",
    tipo: "Aeroporto",
    embarque: "Aeroporto SDU - Santos Dumont",
    desembarque: "Windsor Atlantica Hotel",
    dataHora: "2026-03-01 11:00",
    qtdPax: 3,
    status: "convertida",
    telefone: "(11) 96666-3456",
    email: "ana@email.com",
  },
];

interface TransferContextType {
  solicitacoes: Solicitacao[];
  reservas: Reserva[];
  converterSolicitacao: (id: string) => void;
}

const TransferContext = createContext<TransferContextType>({
  solicitacoes: [],
  reservas: [],
  converterSolicitacao: () => {},
});

export function TransferProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const converterSolicitacao = (id: string) => {
    const sol = solicitacoes.find((s) => s.id === id);
    if (!sol || sol.status !== "pendente") return;

    setSolicitacoes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "convertida" as const } : s))
    );

    const novaReserva: Reserva = {
      id: `RES-${Date.now()}`,
      solicitacaoId: sol.id,
      data: sol.data,
      cliente: sol.cliente,
      tipo: sol.tipo,
      embarque: sol.embarque,
      desembarque: sol.desembarque,
      dataHora: sol.dataHora,
      qtdPax: sol.qtdPax,
      status: "confirmada",
      telefone: sol.telefone,
      email: sol.email,
      observacoes: sol.observacoes,
      criadoEm: new Date().toISOString(),
    };

    setReservas((prev) => [...prev, novaReserva]);
  };

  return (
    <TransferContext.Provider value={{ solicitacoes, reservas, converterSolicitacao }}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  return useContext(TransferContext);
}
