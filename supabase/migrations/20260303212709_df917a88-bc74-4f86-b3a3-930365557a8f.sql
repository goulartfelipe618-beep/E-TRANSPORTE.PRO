
-- Add tenant_id to all operational tables
ALTER TABLE public.motoristas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.motorista_veiculos ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.parceiros ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.parceiro_veiculos ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.subparceiros ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.solicitacoes_transfer ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.solicitacoes_grupos ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.solicitacoes_motorista ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.reservas_transfer ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.reservas_grupos ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.agendamentos_motorista ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.campanhas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.comunicadores ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.automacoes ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.webhook_tests ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.anotacoes ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.tracking_links ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Drop old RLS policies and create tenant-aware ones for each table

-- MOTORISTAS
DROP POLICY IF EXISTS "Auth select motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Auth insert motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Auth update motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Auth delete motoristas" ON public.motoristas;

CREATE POLICY "Tenant select motoristas" ON public.motoristas FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert motoristas" ON public.motoristas FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update motoristas" ON public.motoristas FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete motoristas" ON public.motoristas FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- MOTORISTA_VEICULOS
DROP POLICY IF EXISTS "Auth select motorista_veiculos" ON public.motorista_veiculos;
DROP POLICY IF EXISTS "Auth insert motorista_veiculos" ON public.motorista_veiculos;
DROP POLICY IF EXISTS "Auth update motorista_veiculos" ON public.motorista_veiculos;
DROP POLICY IF EXISTS "Auth delete motorista_veiculos" ON public.motorista_veiculos;

CREATE POLICY "Tenant select motorista_veiculos" ON public.motorista_veiculos FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert motorista_veiculos" ON public.motorista_veiculos FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update motorista_veiculos" ON public.motorista_veiculos FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete motorista_veiculos" ON public.motorista_veiculos FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- PARCEIROS
DROP POLICY IF EXISTS "Auth select parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "Auth insert parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "Auth update parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "Auth delete parceiros" ON public.parceiros;

CREATE POLICY "Tenant select parceiros" ON public.parceiros FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert parceiros" ON public.parceiros FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update parceiros" ON public.parceiros FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete parceiros" ON public.parceiros FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- PARCEIRO_VEICULOS
DROP POLICY IF EXISTS "Auth select parceiro_veiculos" ON public.parceiro_veiculos;
DROP POLICY IF EXISTS "Auth insert parceiro_veiculos" ON public.parceiro_veiculos;
DROP POLICY IF EXISTS "Auth update parceiro_veiculos" ON public.parceiro_veiculos;
DROP POLICY IF EXISTS "Auth delete parceiro_veiculos" ON public.parceiro_veiculos;

CREATE POLICY "Tenant select parceiro_veiculos" ON public.parceiro_veiculos FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert parceiro_veiculos" ON public.parceiro_veiculos FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update parceiro_veiculos" ON public.parceiro_veiculos FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete parceiro_veiculos" ON public.parceiro_veiculos FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- SUBPARCEIROS
DROP POLICY IF EXISTS "Auth select subparceiros" ON public.subparceiros;
DROP POLICY IF EXISTS "Auth insert subparceiros" ON public.subparceiros;
DROP POLICY IF EXISTS "Auth update subparceiros" ON public.subparceiros;
DROP POLICY IF EXISTS "Auth delete subparceiros" ON public.subparceiros;

CREATE POLICY "Tenant select subparceiros" ON public.subparceiros FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert subparceiros" ON public.subparceiros FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update subparceiros" ON public.subparceiros FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete subparceiros" ON public.subparceiros FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- SOLICITACOES_TRANSFER (keep anon insert for webhook)
DROP POLICY IF EXISTS "Auth select solicitacoes_transfer" ON public.solicitacoes_transfer;
DROP POLICY IF EXISTS "Auth update solicitacoes_transfer" ON public.solicitacoes_transfer;
DROP POLICY IF EXISTS "Auth delete solicitacoes_transfer" ON public.solicitacoes_transfer;

CREATE POLICY "Tenant select solicitacoes_transfer" ON public.solicitacoes_transfer FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update solicitacoes_transfer" ON public.solicitacoes_transfer FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete solicitacoes_transfer" ON public.solicitacoes_transfer FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- SOLICITACOES_GRUPOS (keep anon-like policy for webhook but restrict)
DROP POLICY IF EXISTS "Allow all access to solicitacoes_grupos" ON public.solicitacoes_grupos;

CREATE POLICY "Anon insert solicitacoes_grupos" ON public.solicitacoes_grupos FOR INSERT WITH CHECK (true);
CREATE POLICY "Tenant select solicitacoes_grupos" ON public.solicitacoes_grupos FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update solicitacoes_grupos" ON public.solicitacoes_grupos FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete solicitacoes_grupos" ON public.solicitacoes_grupos FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- SOLICITACOES_MOTORISTA (keep anon insert for webhook)
DROP POLICY IF EXISTS "Auth select solicitacoes_motorista" ON public.solicitacoes_motorista;
DROP POLICY IF EXISTS "Auth update solicitacoes_motorista" ON public.solicitacoes_motorista;
DROP POLICY IF EXISTS "Auth delete solicitacoes_motorista" ON public.solicitacoes_motorista;

CREATE POLICY "Tenant select solicitacoes_motorista" ON public.solicitacoes_motorista FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update solicitacoes_motorista" ON public.solicitacoes_motorista FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete solicitacoes_motorista" ON public.solicitacoes_motorista FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- RESERVAS_TRANSFER
DROP POLICY IF EXISTS "Auth select reservas_transfer" ON public.reservas_transfer;
DROP POLICY IF EXISTS "Auth insert reservas_transfer" ON public.reservas_transfer;
DROP POLICY IF EXISTS "Auth update reservas_transfer" ON public.reservas_transfer;
DROP POLICY IF EXISTS "Auth delete reservas_transfer" ON public.reservas_transfer;

CREATE POLICY "Tenant select reservas_transfer" ON public.reservas_transfer FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert reservas_transfer" ON public.reservas_transfer FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update reservas_transfer" ON public.reservas_transfer FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete reservas_transfer" ON public.reservas_transfer FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- RESERVAS_GRUPOS
DROP POLICY IF EXISTS "Allow all access to reservas_grupos" ON public.reservas_grupos;

CREATE POLICY "Tenant select reservas_grupos" ON public.reservas_grupos FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert reservas_grupos" ON public.reservas_grupos FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update reservas_grupos" ON public.reservas_grupos FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete reservas_grupos" ON public.reservas_grupos FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- AGENDAMENTOS_MOTORISTA
DROP POLICY IF EXISTS "Auth select agendamentos_motorista" ON public.agendamentos_motorista;
DROP POLICY IF EXISTS "Auth insert agendamentos_motorista" ON public.agendamentos_motorista;
DROP POLICY IF EXISTS "Auth update agendamentos_motorista" ON public.agendamentos_motorista;
DROP POLICY IF EXISTS "Auth delete agendamentos_motorista" ON public.agendamentos_motorista;

CREATE POLICY "Tenant select agendamentos_motorista" ON public.agendamentos_motorista FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert agendamentos_motorista" ON public.agendamentos_motorista FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update agendamentos_motorista" ON public.agendamentos_motorista FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete agendamentos_motorista" ON public.agendamentos_motorista FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- CAMPANHAS
DROP POLICY IF EXISTS "Auth select campanhas" ON public.campanhas;
DROP POLICY IF EXISTS "Auth insert campanhas" ON public.campanhas;
DROP POLICY IF EXISTS "Auth update campanhas" ON public.campanhas;
DROP POLICY IF EXISTS "Auth delete campanhas" ON public.campanhas;

CREATE POLICY "Tenant select campanhas" ON public.campanhas FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert campanhas" ON public.campanhas FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update campanhas" ON public.campanhas FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete campanhas" ON public.campanhas FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- LEADS (keep anon insert for webhook)
DROP POLICY IF EXISTS "Auth select leads" ON public.leads;
DROP POLICY IF EXISTS "Auth update leads" ON public.leads;
DROP POLICY IF EXISTS "Auth delete leads" ON public.leads;

CREATE POLICY "Tenant select leads" ON public.leads FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update leads" ON public.leads FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete leads" ON public.leads FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- COMUNICADORES
DROP POLICY IF EXISTS "Auth select comunicadores" ON public.comunicadores;
DROP POLICY IF EXISTS "Auth insert comunicadores" ON public.comunicadores;
DROP POLICY IF EXISTS "Auth update comunicadores" ON public.comunicadores;
DROP POLICY IF EXISTS "Auth delete comunicadores" ON public.comunicadores;

CREATE POLICY "Tenant select comunicadores" ON public.comunicadores FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert comunicadores" ON public.comunicadores FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update comunicadores" ON public.comunicadores FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete comunicadores" ON public.comunicadores FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- AUTOMACOES
DROP POLICY IF EXISTS "Auth select automacoes" ON public.automacoes;
DROP POLICY IF EXISTS "Auth insert automacoes" ON public.automacoes;
DROP POLICY IF EXISTS "Auth update automacoes" ON public.automacoes;
DROP POLICY IF EXISTS "Auth delete automacoes" ON public.automacoes;

CREATE POLICY "Tenant select automacoes" ON public.automacoes FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert automacoes" ON public.automacoes FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update automacoes" ON public.automacoes FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete automacoes" ON public.automacoes FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- WEBHOOK_TESTS
DROP POLICY IF EXISTS "Auth select webhook_tests" ON public.webhook_tests;
DROP POLICY IF EXISTS "Auth insert webhook_tests" ON public.webhook_tests;
DROP POLICY IF EXISTS "Auth delete webhook_tests" ON public.webhook_tests;

CREATE POLICY "Tenant select webhook_tests" ON public.webhook_tests FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert webhook_tests" ON public.webhook_tests FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete webhook_tests" ON public.webhook_tests FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- ANOTACOES
DROP POLICY IF EXISTS "Auth select anotacoes" ON public.anotacoes;
DROP POLICY IF EXISTS "Auth insert anotacoes" ON public.anotacoes;
DROP POLICY IF EXISTS "Auth update anotacoes" ON public.anotacoes;
DROP POLICY IF EXISTS "Auth delete anotacoes" ON public.anotacoes;

CREATE POLICY "Tenant select anotacoes" ON public.anotacoes FOR SELECT USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant insert anotacoes" ON public.anotacoes FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant update anotacoes" ON public.anotacoes FOR UPDATE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete anotacoes" ON public.anotacoes FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);

-- TRACKING_LINKS (keep anon select/update for public tracking)
DROP POLICY IF EXISTS "Auth insert tracking_links" ON public.tracking_links;
DROP POLICY IF EXISTS "Auth delete tracking_links" ON public.tracking_links;

CREATE POLICY "Tenant insert tracking_links" ON public.tracking_links FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
CREATE POLICY "Tenant delete tracking_links" ON public.tracking_links FOR DELETE USING (
  has_role(auth.uid(), 'master_admin') OR tenant_id = get_user_tenant(auth.uid())
);
