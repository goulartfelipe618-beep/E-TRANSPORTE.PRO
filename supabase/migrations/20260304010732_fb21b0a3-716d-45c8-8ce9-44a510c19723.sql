-- Make motorista-documentos bucket public
UPDATE storage.buckets SET public = true WHERE id = 'motorista-documentos';

-- Make parceiro-documentos bucket public  
UPDATE storage.buckets SET public = true WHERE id = 'parceiro-documentos';

-- Add SELECT policy for public access to motorista-documentos
CREATE POLICY "Public read motorista-documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'motorista-documentos');

-- Add SELECT policy for public access to parceiro-documentos
CREATE POLICY "Public read parceiro-documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'parceiro-documentos');