
-- Tabela de solicitações recebidas via webhook do site externo
CREATE TABLE public.solicitacoes_transfer (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_viagem TEXT NOT NULL, -- 'somente_ida', 'ida_e_volta', 'por_hora'
  -- Dados do cliente
  cliente_nome TEXT,
  cliente_telefone TEXT,
  cliente_email TEXT,
  -- Ida
  ida_passageiros INTEGER,
  ida_embarque TEXT,
  ida_data DATE,
  ida_hora TEXT,
  ida_destino TEXT,
  ida_mensagem TEXT,
  ida_cupom TEXT,
  -- Volta (apenas ida_e_volta)
  volta_passageiros INTEGER,
  volta_embarque TEXT,
  volta_data DATE,
  volta_hora TEXT,
  volta_destino TEXT,
  volta_mensagem TEXT,
  volta_cupom TEXT,
  -- Por Hora
  por_hora_passageiros INTEGER,
  por_hora_endereco_inicio TEXT,
  por_hora_data DATE,
  por_hora_hora TEXT,
  por_hora_qtd_horas INTEGER,
  por_hora_ponto_encerramento TEXT,
  por_hora_itinerario TEXT,
  por_hora_cupom TEXT,
  -- Controle
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, convertida, cancelada
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: tabela pública para inserts via webhook, leitura sem restrição (admin)
ALTER TABLE public.solicitacoes_transfer ENABLE ROW LEVEL SECURITY;

-- Permitir inserção anônima (webhook externo)
CREATE POLICY "Allow anonymous insert" ON public.solicitacoes_transfer
  FOR INSERT WITH CHECK (true);

-- Permitir leitura para todos (dashboard admin)
CREATE POLICY "Allow read all" ON public.solicitacoes_transfer
  FOR SELECT USING (true);

-- Permitir update para todos (converter status)
CREATE POLICY "Allow update all" ON public.solicitacoes_transfer
  FOR UPDATE USING (true);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_solicitacoes_transfer_updated_at
  BEFORE UPDATE ON public.solicitacoes_transfer
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
