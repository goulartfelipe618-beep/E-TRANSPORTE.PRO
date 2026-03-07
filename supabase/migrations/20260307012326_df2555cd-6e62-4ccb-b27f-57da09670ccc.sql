
INSERT INTO storage.buckets (id, name, public) VALUES ('home-slides', 'home-slides', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Auth upload home-slides" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'home-slides');

CREATE POLICY "Public read home-slides" ON storage.objects
FOR SELECT
USING (bucket_id = 'home-slides');

CREATE POLICY "Auth update home-slides" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'home-slides');

CREATE POLICY "Auth delete home-slides" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'home-slides');
