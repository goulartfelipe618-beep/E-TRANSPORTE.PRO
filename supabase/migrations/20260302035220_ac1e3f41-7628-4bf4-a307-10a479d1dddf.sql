
-- Table: motoristas
CREATE TABLE public.motoristas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Pessoal
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  telefone TEXT NOT NULL,
  email TEXT,
  -- Endereço
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  -- CNH
  cnh_numero TEXT,
  cnh_categoria TEXT,
  cnh_validade DATE,
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  -- Documentos (paths no storage)
  foto_perfil_url TEXT,
  cnh_frente_url TEXT,
  cnh_verso_url TEXT,
  comprovante_residencia_url TEXT,
  -- Pagamento
  tipo_pagamento TEXT,
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT,
  chave_pix TEXT,
  -- Veículo próprio
  possui_veiculo BOOLEAN NOT NULL DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read motoristas" ON public.motoristas FOR SELECT USING (true);
CREATE POLICY "Allow insert motoristas" ON public.motoristas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update motoristas" ON public.motoristas FOR UPDATE USING (true);
CREATE POLICY "Allow delete motoristas" ON public.motoristas FOR DELETE USING (true);

-- Table: motorista_veiculos
CREATE TABLE public.motorista_veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  motorista_id UUID NOT NULL REFERENCES public.motoristas(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cor TEXT,
  placa TEXT NOT NULL,
  combustivel TEXT,
  renavam TEXT,
  chassi TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  -- Documentos veículo
  crlv_url TEXT,
  seguro_url TEXT,
  fotos_url TEXT[], -- array of image paths
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.motorista_veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read motorista_veiculos" ON public.motorista_veiculos FOR SELECT USING (true);
CREATE POLICY "Allow insert motorista_veiculos" ON public.motorista_veiculos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update motorista_veiculos" ON public.motorista_veiculos FOR UPDATE USING (true);
CREATE POLICY "Allow delete motorista_veiculos" ON public.motorista_veiculos FOR DELETE USING (true);

-- Storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public) VALUES ('motorista-documentos', 'motorista-documentos', true);

CREATE POLICY "Allow public read motorista docs" ON storage.objects FOR SELECT USING (bucket_id = 'motorista-documentos');
CREATE POLICY "Allow upload motorista docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'motorista-documentos');
CREATE POLICY "Allow update motorista docs" ON storage.objects FOR UPDATE USING (bucket_id = 'motorista-documentos');
CREATE POLICY "Allow delete motorista docs" ON storage.objects FOR DELETE USING (bucket_id = 'motorista-documentos');
