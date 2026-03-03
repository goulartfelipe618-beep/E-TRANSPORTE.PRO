
-- Solicitações de Grupos (same structure as solicitacoes_transfer but for groups)
CREATE TABLE public.solicitacoes_grupos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_veiculo TEXT,
  numero_passageiros INTEGER,
  endereco_embarque TEXT,
  destino TEXT,
  data_ida TEXT,
  hora_ida TEXT,
  data_retorno TEXT,
  hora_retorno TEXT,
  observacoes TEXT,
  cupom TEXT,
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_whatsapp TEXT,
  cliente_origem TEXT,
  automacao_id UUID REFERENCES public.automacoes(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to solicitacoes_grupos" ON public.solicitacoes_grupos FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_solicitacoes_grupos_updated_at
BEFORE UPDATE ON public.solicitacoes_grupos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reservas de Grupos (same structure as reservas_transfer but for groups)
CREATE TABLE public.reservas_grupos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitacao_id UUID REFERENCES public.solicitacoes_grupos(id),
  tipo_veiculo TEXT,
  numero_passageiros INTEGER,
  endereco_embarque TEXT,
  destino TEXT,
  data_ida TEXT,
  hora_ida TEXT,
  data_retorno TEXT,
  hora_retorno TEXT,
  observacoes TEXT,
  cupom TEXT,
  cliente_nome TEXT,
  cliente_cpf_cnpj TEXT,
  cliente_email TEXT,
  cliente_whatsapp TEXT,
  cliente_origem TEXT,
  motorista_nome TEXT,
  motorista_telefone TEXT,
  veiculo TEXT,
  valor_base NUMERIC,
  desconto_percentual NUMERIC,
  valor_total NUMERIC,
  metodo_pagamento TEXT,
  status TEXT NOT NULL DEFAULT 'confirmada',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservas_grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to reservas_grupos" ON public.reservas_grupos FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_reservas_grupos_updated_at
BEFORE UPDATE ON public.reservas_grupos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
