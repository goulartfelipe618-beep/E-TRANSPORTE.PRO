
-- Fix existing webhook_tests without tenant_id
UPDATE webhook_tests wt
SET tenant_id = a.tenant_id
FROM automacoes a
WHERE wt.automacao_id = a.id AND wt.tenant_id IS NULL;

-- Fix existing solicitacoes_transfer without tenant_id
UPDATE solicitacoes_transfer st
SET tenant_id = a.tenant_id
FROM automacoes a
WHERE st.automacao_id = a.id AND st.tenant_id IS NULL;

-- Fix existing solicitacoes_motorista without tenant_id (no automacao_id link, skip)

-- Fix existing solicitacoes_grupos without tenant_id
UPDATE solicitacoes_grupos sg
SET tenant_id = a.tenant_id
FROM automacoes a
WHERE sg.automacao_id = a.id AND sg.tenant_id IS NULL;
