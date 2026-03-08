
ALTER TABLE public.master_webhooks
  ADD COLUMN auto_comunicar boolean NOT NULL DEFAULT false,
  ADD COLUMN auto_comunicar_config jsonb NOT NULL DEFAULT '{}'::jsonb;
