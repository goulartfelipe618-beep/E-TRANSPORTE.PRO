
CREATE TABLE public.master_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text,
  webhook_slug text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  recebimento_ativo boolean NOT NULL DEFAULT true,
  webhook_url_envio text,
  envio_ativo boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.master_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master full access master_webhooks"
  ON public.master_webhooks
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));
