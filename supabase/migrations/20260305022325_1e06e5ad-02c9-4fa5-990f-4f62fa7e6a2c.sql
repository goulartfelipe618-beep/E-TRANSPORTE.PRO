
CREATE TABLE public.website_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando',
  
  -- Domain
  possui_dominio BOOLEAN DEFAULT false,
  dominio TEXT,
  provedor_atual TEXT,
  acesso_dns BOOLEAN DEFAULT false,
  
  -- Services
  tipos_servico TEXT[] DEFAULT '{}',
  venda_produtos_online BOOLEAN DEFAULT false,
  produtos_descricao TEXT,
  produtos_quantidade TEXT,
  pagamento_online BOOLEAN DEFAULT false,
  
  -- Company
  nome_empresa TEXT,
  cidade_atuacao TEXT,
  regiao_atendida TEXT,
  diferenciais TEXT,
  frota TEXT,
  trabalha_24h BOOLEAN DEFAULT false,
  whatsapp TEXT,
  email_profissional TEXT,
  redes_sociais TEXT,
  
  -- Positioning
  publico_alvo TEXT,
  faixa_preco TEXT,
  captacao_orcamento BOOLEAN DEFAULT false,
  integracao_whatsapp BOOLEAN DEFAULT false,
  
  -- Visual Identity
  possui_logotipo BOOLEAN DEFAULT false,
  logo_url TEXT,
  cores_preferidas TEXT,
  estilo_desejado TEXT,
  
  -- Features
  funcionalidades TEXT[] DEFAULT '{}',
  
  -- Publication
  site_url TEXT,
  data_publicacao TIMESTAMPTZ,
  observacoes_master TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.website_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select website_briefings" ON public.website_briefings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant insert website_briefings" ON public.website_briefings
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant update website_briefings" ON public.website_briefings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role) OR (tenant_id = get_user_tenant(auth.uid())));

CREATE POLICY "Tenant delete website_briefings" ON public.website_briefings
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role));
