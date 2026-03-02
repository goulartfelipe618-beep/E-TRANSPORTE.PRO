
-- Table for multiple webhook automations
CREATE TABLE public.automacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  webhook_enabled boolean NOT NULL DEFAULT false,
  mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.automacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read automacoes" ON public.automacoes FOR SELECT USING (true);
CREATE POLICY "Allow insert automacoes" ON public.automacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update automacoes" ON public.automacoes FOR UPDATE USING (true);
CREATE POLICY "Allow delete automacoes" ON public.automacoes FOR DELETE USING (true);

-- Add automacao_id to webhook_tests so tests are linked to a specific automation
ALTER TABLE public.webhook_tests ADD COLUMN automacao_id uuid REFERENCES public.automacoes(id) ON DELETE CASCADE;

-- Add automacao_id to solicitacoes_transfer to track which automation created it
ALTER TABLE public.solicitacoes_transfer ADD COLUMN automacao_id uuid REFERENCES public.automacoes(id) ON DELETE SET NULL;
