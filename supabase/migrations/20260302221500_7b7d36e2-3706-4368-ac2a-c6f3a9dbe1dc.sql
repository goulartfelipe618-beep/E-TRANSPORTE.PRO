
CREATE TABLE public.solicitacoes_motorista (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo text NOT NULL,
  cpf text,
  telefone text,
  email text,
  cidade text,
  estado text,
  cnh_categoria text,
  cnh_numero text,
  possui_veiculo boolean DEFAULT false,
  veiculo_marca text,
  veiculo_modelo text,
  veiculo_ano text,
  veiculo_placa text,
  experiencia text,
  mensagem text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_motorista ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read solicitacoes_motorista" ON public.solicitacoes_motorista FOR SELECT USING (true);
CREATE POLICY "Allow insert solicitacoes_motorista" ON public.solicitacoes_motorista FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update solicitacoes_motorista" ON public.solicitacoes_motorista FOR UPDATE USING (true);
CREATE POLICY "Allow delete solicitacoes_motorista" ON public.solicitacoes_motorista FOR DELETE USING (true);
