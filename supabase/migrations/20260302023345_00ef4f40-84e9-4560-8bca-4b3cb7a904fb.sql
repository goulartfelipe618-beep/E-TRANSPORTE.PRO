
-- Add new fields to reservas_transfer for CPF, vehicle, driver, and payment info
ALTER TABLE public.reservas_transfer
  ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj text,
  ADD COLUMN IF NOT EXISTS veiculo text,
  ADD COLUMN IF NOT EXISTS motorista_nome text,
  ADD COLUMN IF NOT EXISTS motorista_telefone text,
  ADD COLUMN IF NOT EXISTS valor_base numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_percentual numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metodo_pagamento text,
  ADD COLUMN IF NOT EXISTS observacoes text;
