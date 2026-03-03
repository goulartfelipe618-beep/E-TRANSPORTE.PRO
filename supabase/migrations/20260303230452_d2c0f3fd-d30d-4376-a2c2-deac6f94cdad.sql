
-- Network contacts table for company registry across all categories
CREATE TABLE public.network_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  categoria text NOT NULL, -- hoteis, agencias, clinicas, laboratorios, shows, casamentos, embaixadas, governo
  nome_empresa text NOT NULL,
  cnpj text,
  tipo_estabelecimento text,
  endereco text,
  estado text,
  cidade text,
  website text,
  contato_nome text,
  contato_cargo text,
  contato_telefone text,
  contato_email text,
  status_contato text NOT NULL DEFAULT 'prospect',
  potencial_negocio text DEFAULT 'medio',
  responsavel text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.network_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select network_contacts" ON public.network_contacts
  FOR SELECT USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant insert network_contacts" ON public.network_contacts
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant update network_contacts" ON public.network_contacts
  FOR UPDATE USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant delete network_contacts" ON public.network_contacts
  FOR DELETE USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE TRIGGER update_network_contacts_updated_at
  BEFORE UPDATE ON public.network_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
