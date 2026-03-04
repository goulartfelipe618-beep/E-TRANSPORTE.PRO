
-- Fix old webhook_tests that still have null tenant_id
UPDATE webhook_tests wt
SET tenant_id = a.tenant_id
FROM automacoes a
WHERE wt.automacao_id = a.id AND wt.tenant_id IS NULL AND a.tenant_id IS NOT NULL;
