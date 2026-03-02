
-- System settings table (key-value store for global config)
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow insert system_settings" ON public.system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update system_settings" ON public.system_settings FOR UPDATE USING (true);
CREATE POLICY "Allow delete system_settings" ON public.system_settings FOR DELETE USING (true);

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for logo
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

CREATE POLICY "Allow public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Allow upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Allow update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');
CREATE POLICY "Allow delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');
