
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'solicitacao',
  titulo TEXT NOT NULL,
  mensagem TEXT,
  referencia_id UUID,
  referencia_tipo TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Tenant select notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant update notifications"
ON public.notifications FOR UPDATE
USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant delete notifications"
ON public.notifications FOR DELETE
USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "System insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function to create notification on new solicitacao_transfer
CREATE OR REPLACE FUNCTION public.notify_new_solicitacao_transfer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (tenant_id, tipo, titulo, mensagem, referencia_id, referencia_tipo)
  VALUES (
    NEW.tenant_id,
    'transfer',
    'Nova solicitação de Transfer',
    COALESCE('Cliente: ' || NEW.cliente_nome, 'Nova solicitação recebida'),
    NEW.id,
    'solicitacoes_transfer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_solicitacao_transfer
AFTER INSERT ON public.solicitacoes_transfer
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_solicitacao_transfer();

-- Trigger for solicitacoes_motorista
CREATE OR REPLACE FUNCTION public.notify_new_solicitacao_motorista()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (tenant_id, tipo, titulo, mensagem, referencia_id, referencia_tipo)
  VALUES (
    NEW.tenant_id,
    'motorista',
    'Nova solicitação de Motorista',
    COALESCE('Candidato: ' || NEW.nome_completo, 'Nova candidatura recebida'),
    NEW.id,
    'solicitacoes_motorista'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_solicitacao_motorista
AFTER INSERT ON public.solicitacoes_motorista
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_solicitacao_motorista();

-- Trigger for solicitacoes_grupos
CREATE OR REPLACE FUNCTION public.notify_new_solicitacao_grupos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (tenant_id, tipo, titulo, mensagem, referencia_id, referencia_tipo)
  VALUES (
    NEW.tenant_id,
    'grupo',
    'Nova solicitação de Grupo',
    COALESCE('Cliente: ' || NEW.cliente_nome, 'Nova solicitação de grupo recebida'),
    NEW.id,
    'solicitacoes_grupos'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_solicitacao_grupos
AFTER INSERT ON public.solicitacoes_grupos
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_solicitacao_grupos();
