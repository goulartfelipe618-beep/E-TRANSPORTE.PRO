
CREATE TABLE public.solicitacoes_comunicador (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nome_projeto text NOT NULL DEFAULT '',
  telefone_whatsapp text NOT NULL DEFAULT '',
  instance_name text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_comunicador ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select solicitacoes_comunicador" ON public.solicitacoes_comunicador
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant insert solicitacoes_comunicador" ON public.solicitacoes_comunicador
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant update solicitacoes_comunicador" ON public.solicitacoes_comunicador
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant delete solicitacoes_comunicador" ON public.solicitacoes_comunicador
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role));
