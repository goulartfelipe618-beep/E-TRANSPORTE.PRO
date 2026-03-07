
CREATE TABLE public.solicitacoes_dominio (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  user_id uuid NOT NULL,
  dominio text NOT NULL,
  plano text NOT NULL,
  valor numeric NOT NULL,
  cpf text NOT NULL,
  nome_completo text NOT NULL,
  email text NOT NULL,
  cep text NOT NULL,
  endereco text NOT NULL,
  numero text NOT NULL,
  complemento text,
  uf text NOT NULL,
  cidade text NOT NULL,
  ddd text NOT NULL,
  telefone text NOT NULL,
  ramal text,
  aceite_contrato boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'em_analise',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_dominio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select solicitacoes_dominio" ON public.solicitacoes_dominio
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant insert solicitacoes_dominio" ON public.solicitacoes_dominio
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant update solicitacoes_dominio" ON public.solicitacoes_dominio
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant delete solicitacoes_dominio" ON public.solicitacoes_dominio
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role));
