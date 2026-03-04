
ALTER TABLE public.motoristas
ADD COLUMN IF NOT EXISTS nome_recebedor text,
ADD COLUMN IF NOT EXISTS cpf_cnpj_recebedor text;
