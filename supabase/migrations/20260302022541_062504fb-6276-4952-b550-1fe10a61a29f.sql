
-- Create reservas_transfer table
CREATE TABLE public.reservas_transfer (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitacao_id uuid REFERENCES public.solicitacoes_transfer(id) ON DELETE SET NULL,
  tipo_viagem text NOT NULL,
  cliente_nome text,
  cliente_telefone text,
  cliente_email text,
  cliente_origem text,
  ida_passageiros integer,
  ida_embarque text,
  ida_destino text,
  ida_data date,
  ida_hora text,
  ida_mensagem text,
  ida_cupom text,
  volta_passageiros integer,
  volta_embarque text,
  volta_destino text,
  volta_data date,
  volta_hora text,
  volta_mensagem text,
  volta_cupom text,
  por_hora_passageiros integer,
  por_hora_endereco_inicio text,
  por_hora_data date,
  por_hora_hora text,
  por_hora_qtd_horas integer,
  por_hora_ponto_encerramento text,
  por_hora_itinerario text,
  por_hora_cupom text,
  status text NOT NULL DEFAULT 'confirmada',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservas_transfer ENABLE ROW LEVEL SECURITY;

-- Policies (same open access as solicitacoes for now)
CREATE POLICY "Allow read all reservas" ON public.reservas_transfer FOR SELECT USING (true);
CREATE POLICY "Allow insert reservas" ON public.reservas_transfer FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update reservas" ON public.reservas_transfer FOR UPDATE USING (true);
CREATE POLICY "Allow delete reservas" ON public.reservas_transfer FOR DELETE USING (true);

-- Also allow delete on solicitacoes
CREATE POLICY "Allow delete solicitacoes" ON public.solicitacoes_transfer FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_reservas_transfer_updated_at
  BEFORE UPDATE ON public.reservas_transfer
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
