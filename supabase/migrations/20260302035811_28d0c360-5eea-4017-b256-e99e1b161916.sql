
-- Table: parceiros (empresas parceiras)
CREATE TABLE public.parceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Empresa
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  inscricao_estadual TEXT,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  -- Endereço
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  -- Responsável
  responsavel_nome TEXT,
  responsavel_telefone TEXT,
  responsavel_email TEXT,
  -- Docs (storage paths)
  logo_url TEXT,
  contrato_url TEXT,
  -- Obs
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read parceiros" ON public.parceiros FOR SELECT USING (true);
CREATE POLICY "Allow insert parceiros" ON public.parceiros FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update parceiros" ON public.parceiros FOR UPDATE USING (true);
CREATE POLICY "Allow delete parceiros" ON public.parceiros FOR DELETE USING (true);

-- Table: parceiro_veiculos
CREATE TABLE public.parceiro_veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parceiro_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER,
  placa TEXT NOT NULL,
  cor TEXT,
  combustivel TEXT,
  renavam TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  crlv_url TEXT,
  seguro_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parceiro_veiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read parceiro_veiculos" ON public.parceiro_veiculos FOR SELECT USING (true);
CREATE POLICY "Allow insert parceiro_veiculos" ON public.parceiro_veiculos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update parceiro_veiculos" ON public.parceiro_veiculos FOR UPDATE USING (true);
CREATE POLICY "Allow delete parceiro_veiculos" ON public.parceiro_veiculos FOR DELETE USING (true);

-- Table: subparceiros
CREATE TABLE public.subparceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parceiro_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  funcao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subparceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read subparceiros" ON public.subparceiros FOR SELECT USING (true);
CREATE POLICY "Allow insert subparceiros" ON public.subparceiros FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update subparceiros" ON public.subparceiros FOR UPDATE USING (true);
CREATE POLICY "Allow delete subparceiros" ON public.subparceiros FOR DELETE USING (true);

-- Storage bucket for partner documents
INSERT INTO storage.buckets (id, name, public) VALUES ('parceiro-documentos', 'parceiro-documentos', true);
CREATE POLICY "Allow public read parceiro docs" ON storage.objects FOR SELECT USING (bucket_id = 'parceiro-documentos');
CREATE POLICY "Allow upload parceiro docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'parceiro-documentos');
CREATE POLICY "Allow update parceiro docs" ON storage.objects FOR UPDATE USING (bucket_id = 'parceiro-documentos');
CREATE POLICY "Allow delete parceiro docs" ON storage.objects FOR DELETE USING (bucket_id = 'parceiro-documentos');
