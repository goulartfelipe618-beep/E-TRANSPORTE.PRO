
-- Network categories managed by Master Admin
CREATE TABLE public.network_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  descricao text,
  tipos_estabelecimento text[] NOT NULL DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.network_categories ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Auth read network_categories" ON public.network_categories
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Only master_admin can manage
CREATE POLICY "Master full access network_categories" ON public.network_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- Seed with existing categories
INSERT INTO public.network_categories (nome, slug, tipos_estabelecimento) VALUES
  ('Hotéis e Resorts', 'hoteis', ARRAY['Hotel', 'Resort', 'Pousada', 'Apart-hotel', 'Hostel']),
  ('Agências de Viagens', 'agencias', ARRAY['Agência de Viagens', 'Operadora de Turismo', 'Consolidadora']),
  ('Clínicas e Hospitais', 'clinicas', ARRAY['Clínica', 'Hospital', 'Centro Médico', 'Laboratório Hospitalar']),
  ('Laboratórios e Farmácias', 'laboratorios', ARRAY['Laboratório', 'Farmácia', 'Distribuidora Farmacêutica']),
  ('Produtores de Shows', 'shows', ARRAY['Produtora de Eventos', 'Casa de Shows', 'Promoter', 'Festival']),
  ('Empresas de Casamento', 'casamentos', ARRAY['Cerimonialista', 'Buffet', 'Espaço de Eventos', 'Decoração']),
  ('Embaixadas e Consulados', 'embaixadas', ARRAY['Embaixada', 'Consulado', 'Representação Diplomática']),
  ('Órgãos Governamentais', 'governo', ARRAY['Prefeitura', 'Secretaria', 'Autarquia', 'Empresa Pública']);
