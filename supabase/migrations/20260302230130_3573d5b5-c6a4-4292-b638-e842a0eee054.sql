
-- Campanhas table
CREATE TABLE public.campanhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  plataforma TEXT,
  link TEXT,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read campanhas" ON public.campanhas FOR SELECT USING (true);
CREATE POLICY "Allow insert campanhas" ON public.campanhas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update campanhas" ON public.campanhas FOR UPDATE USING (true);
CREATE POLICY "Allow delete campanhas" ON public.campanhas FOR DELETE USING (true);

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID REFERENCES public.campanhas(id) ON DELETE SET NULL,
  nome TEXT NOT NULL DEFAULT 'Sem nome',
  email TEXT,
  telefone TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  observacoes TEXT,
  valor_venda NUMERIC DEFAULT 0,
  data_conversao DATE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update leads" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow delete leads" ON public.leads FOR DELETE USING (true);
