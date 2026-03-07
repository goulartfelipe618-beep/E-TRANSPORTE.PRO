
CREATE TABLE public.master_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secao text NOT NULL DEFAULT 'home',
  posicao integer NOT NULL DEFAULT 0,
  titulo text NOT NULL DEFAULT '',
  subtitulo text NOT NULL DEFAULT '',
  imagem_url text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.master_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master full access master_slides" ON public.master_slides
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Auth read master_slides" ON public.master_slides
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);
