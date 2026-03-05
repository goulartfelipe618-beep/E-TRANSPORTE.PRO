
CREATE TABLE public.google_business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id),
  entidade_tipo TEXT NOT NULL DEFAULT 'motorista',
  entidade_id UUID,
  nome_empresa TEXT NOT NULL,
  categoria_principal TEXT,
  categoria_secundaria TEXT,
  descricao TEXT,
  endereco TEXT,
  area_atendimento TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  telefone TEXT,
  whatsapp TEXT,
  website TEXT,
  horario_padrao JSONB DEFAULT '{}',
  horarios_especiais JSONB DEFAULT '[]',
  logo_url TEXT,
  capa_url TEXT,
  fotos_url TEXT[] DEFAULT '{}',
  google_location_name TEXT,
  google_account_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'nao_enviado',
  api_errors JSONB DEFAULT '[]',
  service_area_business BOOLEAN NOT NULL DEFAULT false,
  etapa_atual INTEGER NOT NULL DEFAULT 1,
  dados_validados BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.google_business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select google_business_profiles" ON public.google_business_profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));
CREATE POLICY "Tenant insert google_business_profiles" ON public.google_business_profiles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));
CREATE POLICY "Tenant update google_business_profiles" ON public.google_business_profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));
CREATE POLICY "Tenant delete google_business_profiles" ON public.google_business_profiles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE TRIGGER update_google_business_profiles_updated_at BEFORE UPDATE ON public.google_business_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
