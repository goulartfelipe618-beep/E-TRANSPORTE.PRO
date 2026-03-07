
CREATE TABLE public.home_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao integer NOT NULL DEFAULT 0,
  titulo text NOT NULL DEFAULT '',
  subtitulo text NOT NULL DEFAULT '',
  imagem_url text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select home_slides" ON public.home_slides
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant insert home_slides" ON public.home_slides
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant update home_slides" ON public.home_slides
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant delete home_slides" ON public.home_slides
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));
