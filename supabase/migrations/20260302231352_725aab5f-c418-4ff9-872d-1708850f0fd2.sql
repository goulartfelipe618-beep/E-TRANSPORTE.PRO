
CREATE TABLE public.anotacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL DEFAULT 'Sem título',
  conteudo TEXT NOT NULL DEFAULT '',
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.anotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read anotacoes" ON public.anotacoes FOR SELECT USING (true);
CREATE POLICY "Allow insert anotacoes" ON public.anotacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update anotacoes" ON public.anotacoes FOR UPDATE USING (true);
CREATE POLICY "Allow delete anotacoes" ON public.anotacoes FOR DELETE USING (true);
