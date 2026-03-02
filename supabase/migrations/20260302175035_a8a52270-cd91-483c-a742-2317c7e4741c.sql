
-- Table to store test webhook payloads for the automation mapping feature
CREATE TABLE public.webhook_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL DEFAULT 'Teste',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read webhook_tests" ON public.webhook_tests FOR SELECT USING (true);
CREATE POLICY "Allow insert webhook_tests" ON public.webhook_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete webhook_tests" ON public.webhook_tests FOR DELETE USING (true);
