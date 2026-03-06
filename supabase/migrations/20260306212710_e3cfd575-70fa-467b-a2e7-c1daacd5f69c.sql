
-- Sequences for each entity
CREATE SEQUENCE IF NOT EXISTS public.seq_solicitacao_grupo START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_solicitacao_transfer START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_solicitacao_motorista START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_lead START 1;

-- Add codigo columns
ALTER TABLE public.solicitacoes_grupos ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE public.solicitacoes_transfer ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE public.solicitacoes_motorista ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS codigo text;

-- Auto-generate codes via triggers
CREATE OR REPLACE FUNCTION public.generate_codigo_grupo()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.codigo := '#' || LPAD(nextval('public.seq_solicitacao_grupo')::text, 6, '0') || 'GR';
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_codigo_transfer()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.codigo := '#' || LPAD(nextval('public.seq_solicitacao_transfer')::text, 6, '0') || 'TR';
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_codigo_motorista()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.codigo := '#' || LPAD(nextval('public.seq_solicitacao_motorista')::text, 6, '0') || 'MO';
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_codigo_lead()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.codigo := '#' || LPAD(nextval('public.seq_lead')::text, 6, '0') || 'LE';
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trg_codigo_grupo BEFORE INSERT ON public.solicitacoes_grupos
FOR EACH ROW WHEN (NEW.codigo IS NULL) EXECUTE FUNCTION public.generate_codigo_grupo();

CREATE TRIGGER trg_codigo_transfer BEFORE INSERT ON public.solicitacoes_transfer
FOR EACH ROW WHEN (NEW.codigo IS NULL) EXECUTE FUNCTION public.generate_codigo_transfer();

CREATE TRIGGER trg_codigo_motorista BEFORE INSERT ON public.solicitacoes_motorista
FOR EACH ROW WHEN (NEW.codigo IS NULL) EXECUTE FUNCTION public.generate_codigo_motorista();

CREATE TRIGGER trg_codigo_lead BEFORE INSERT ON public.leads
FOR EACH ROW WHEN (NEW.codigo IS NULL) EXECUTE FUNCTION public.generate_codigo_lead();

-- Backfill existing records
UPDATE public.solicitacoes_grupos SET codigo = '#' || LPAD(nextval('public.seq_solicitacao_grupo')::text, 6, '0') || 'GR' WHERE codigo IS NULL;
UPDATE public.solicitacoes_transfer SET codigo = '#' || LPAD(nextval('public.seq_solicitacao_transfer')::text, 6, '0') || 'TR' WHERE codigo IS NULL;
UPDATE public.solicitacoes_motorista SET codigo = '#' || LPAD(nextval('public.seq_solicitacao_motorista')::text, 6, '0') || 'MO' WHERE codigo IS NULL;
UPDATE public.leads SET codigo = '#' || LPAD(nextval('public.seq_lead')::text, 6, '0') || 'LE' WHERE codigo IS NULL;
