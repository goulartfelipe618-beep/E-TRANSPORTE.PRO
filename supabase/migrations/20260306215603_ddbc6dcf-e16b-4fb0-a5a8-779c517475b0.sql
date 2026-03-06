ALTER TABLE public.website_briefings 
ADD COLUMN IF NOT EXISTS modelo_selecionado text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS modelo_nome text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS modelo_preview_url text DEFAULT NULL;