
-- Create master_files table for file uploads in master annotations
CREATE TABLE public.master_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tamanho bigint NOT NULL DEFAULT 0,
  tipo text NOT NULL DEFAULT '',
  storage_path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.master_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master full access master_files" ON public.master_files
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- Create storage bucket for master files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('master-files', 'master-files', false, 52428800);

-- RLS for master-files bucket
CREATE POLICY "Master upload master-files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'master-files' AND has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master read master-files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'master-files' AND has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master delete master-files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'master-files' AND has_role(auth.uid(), 'master_admin'::app_role));
