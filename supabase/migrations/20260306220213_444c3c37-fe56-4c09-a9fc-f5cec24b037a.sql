CREATE TABLE public.website_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preview_url text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.website_templates ENABLE ROW LEVEL SECURITY;

-- Only master_admin can manage templates
CREATE POLICY "Master full access website_templates" ON public.website_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- All authenticated users can read active templates
CREATE POLICY "Auth read website_templates" ON public.website_templates
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);