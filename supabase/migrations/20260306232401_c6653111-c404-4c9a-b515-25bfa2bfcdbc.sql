
-- Create storage bucket for website template thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('website-templates', 'website-templates', true);

-- Allow authenticated users to read
CREATE POLICY "Public read website-templates" ON storage.objects FOR SELECT USING (bucket_id = 'website-templates');

-- Allow master admins to upload/update/delete
CREATE POLICY "Master upload website-templates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'website-templates' AND public.has_role(auth.uid(), 'master_admin'::public.app_role));

CREATE POLICY "Master update website-templates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'website-templates' AND public.has_role(auth.uid(), 'master_admin'::public.app_role));

CREATE POLICY "Master delete website-templates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'website-templates' AND public.has_role(auth.uid(), 'master_admin'::public.app_role));
