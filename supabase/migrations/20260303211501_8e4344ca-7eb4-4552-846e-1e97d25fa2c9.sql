
-- Role enum
CREATE TYPE public.app_role AS ENUM ('master_admin', 'admin', 'user');

-- Tenants (cada cliente do CRM)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separado de profiles, conforme boas práticas)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'admin',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);

-- Menu config por tenant
CREATE TABLE public.tenant_menu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  menu_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(tenant_id, menu_key)
);

-- Categorias de automação (configuráveis pelo master)
CREATE TABLE public.automation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  campos JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logs do sistema
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configs de API (gerenciadas pelo master)
CREATE TABLE public.api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS em todas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_menu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configs ENABLE ROW LEVEL SECURITY;

-- Função security definer para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para obter tenant do usuário
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tenant_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS: Tenants
CREATE POLICY "Master full access tenants" ON public.tenants FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users see own tenant" ON public.tenants FOR SELECT
  USING (id = public.get_user_tenant(auth.uid()));

-- RLS: User roles
CREATE POLICY "Master full access user_roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users see own role" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- RLS: Menu config
CREATE POLICY "Master full access menu_config" ON public.tenant_menu_config FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users see own tenant menu" ON public.tenant_menu_config FOR SELECT
  USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS: Automation categories
CREATE POLICY "Master full access automation_categories" ON public.automation_categories FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Auth read automation_categories" ON public.automation_categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS: System logs
CREATE POLICY "Master full access system_logs" ON public.system_logs FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Auth insert system_logs" ON public.system_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users see own tenant logs" ON public.system_logs FOR SELECT
  USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS: API configs
CREATE POLICY "Master full access api_configs" ON public.api_configs FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Auth read api_configs" ON public.api_configs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Triggers updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automation_categories_updated_at BEFORE UPDATE ON public.automation_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_configs_updated_at BEFORE UPDATE ON public.api_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
