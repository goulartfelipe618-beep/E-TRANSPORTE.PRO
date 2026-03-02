-- Criar bucket para uploads recebidos via webhook
INSERT INTO storage.buckets (id, name, public) VALUES ('webhook-uploads', 'webhook-uploads', true);

-- Política de leitura pública
CREATE POLICY "Public read webhook-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'webhook-uploads');

-- Política de inserção via service role (edge function)
CREATE POLICY "Service role insert webhook-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'webhook-uploads');

-- Política de deleção
CREATE POLICY "Service role delete webhook-uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'webhook-uploads');