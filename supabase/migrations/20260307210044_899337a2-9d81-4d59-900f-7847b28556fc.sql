
CREATE TABLE public.solicitacoes_email (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  user_id uuid NOT NULL,
  nome_completo text NOT NULL,
  nome_empresa text NOT NULL,
  dominio text NOT NULL,
  email_solicitado text NOT NULL,
  plano text NOT NULL,
  valor text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  email_criado text,
  webmail_url text,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_email ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select solicitacoes_email" ON public.solicitacoes_email
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant insert solicitacoes_email" ON public.solicitacoes_email
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Master update solicitacoes_email" ON public.solicitacoes_email
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master delete solicitacoes_email" ON public.solicitacoes_email
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role));
