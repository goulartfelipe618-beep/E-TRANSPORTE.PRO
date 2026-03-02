
-- Table for driver meeting schedules
CREATE TABLE public.agendamentos_motorista (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  motorista_nome TEXT NOT NULL,
  motorista_telefone TEXT NOT NULL,
  motorista_email TEXT,
  tipo_servico TEXT NOT NULL DEFAULT 'reuniao',
  status TEXT NOT NULL DEFAULT 'agendado',
  data_servico DATE NOT NULL,
  horario TEXT NOT NULL,
  local_origem TEXT,
  local_destino TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agendamentos_motorista ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read agendamentos_motorista" ON public.agendamentos_motorista FOR SELECT USING (true);
CREATE POLICY "Allow insert agendamentos_motorista" ON public.agendamentos_motorista FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update agendamentos_motorista" ON public.agendamentos_motorista FOR UPDATE USING (true);
CREATE POLICY "Allow delete agendamentos_motorista" ON public.agendamentos_motorista FOR DELETE USING (true);

-- Table for WhatsApp communicator webhooks (max 3)
CREATE TABLE public.comunicadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comunicadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read comunicadores" ON public.comunicadores FOR SELECT USING (true);
CREATE POLICY "Allow insert comunicadores" ON public.comunicadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update comunicadores" ON public.comunicadores FOR UPDATE USING (true);
CREATE POLICY "Allow delete comunicadores" ON public.comunicadores FOR DELETE USING (true);
