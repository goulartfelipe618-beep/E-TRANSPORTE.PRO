
-- Sequência para código do taxi
CREATE SEQUENCE IF NOT EXISTS public.seq_solicitacao_taxi START 1;

-- Tabela de solicitações de taxi
CREATE TABLE public.solicitacoes_taxi (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text,
  tenant_id uuid REFERENCES public.tenants(id),
  cliente_nome text,
  cliente_telefone text,
  cliente_email text,
  cliente_origem text,
  endereco_origem text,
  endereco_destino text,
  data_servico date,
  horario text,
  numero_passageiros integer DEFAULT 1,
  observacoes text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Código sequencial automático #000000TX
CREATE OR REPLACE FUNCTION public.generate_codigo_taxi()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.codigo := '#' || LPAD(nextval('public.seq_solicitacao_taxi')::text, 6, '0') || 'TX';
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_codigo_taxi
  BEFORE INSERT ON public.solicitacoes_taxi
  FOR EACH ROW EXECUTE FUNCTION public.generate_codigo_taxi();

-- updated_at automático
CREATE TRIGGER update_solicitacoes_taxi_updated_at
  BEFORE UPDATE ON public.solicitacoes_taxi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.solicitacoes_taxi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select solicitacoes_taxi"
  ON public.solicitacoes_taxi FOR SELECT
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant insert solicitacoes_taxi"
  ON public.solicitacoes_taxi FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant update solicitacoes_taxi"
  ON public.solicitacoes_taxi FOR UPDATE
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

CREATE POLICY "Tenant delete solicitacoes_taxi"
  ON public.solicitacoes_taxi FOR DELETE
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR tenant_id = get_user_tenant(auth.uid()));

-- Notificação automática ao criar nova solicitação
CREATE OR REPLACE FUNCTION public.notify_new_solicitacao_taxi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (tenant_id, tipo, titulo, mensagem, referencia_id, referencia_tipo)
  VALUES (
    NEW.tenant_id,
    'taxi',
    'Nova solicitação de Taxi',
    COALESCE('Cliente: ' || NEW.cliente_nome, 'Nova solicitação recebida'),
    NEW.id,
    'solicitacoes_taxi'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_taxi_solicitacao
  AFTER INSERT ON public.solicitacoes_taxi
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_solicitacao_taxi();
