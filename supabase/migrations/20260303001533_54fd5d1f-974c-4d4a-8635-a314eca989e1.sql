
-- =====================================================
-- FIX RLS: Replace all USING(true) with auth-based policies
-- =====================================================

-- 1. AGENDAMENTOS_MOTORISTA: Auth required for all operations
DROP POLICY IF EXISTS "Allow delete agendamentos_motorista" ON public.agendamentos_motorista;
DROP POLICY IF EXISTS "Allow insert agendamentos_motorista" ON public.agendamentos_motorista;
DROP POLICY IF EXISTS "Allow read agendamentos_motorista" ON public.agendamentos_motorista;
DROP POLICY IF EXISTS "Allow update agendamentos_motorista" ON public.agendamentos_motorista;

CREATE POLICY "Auth select agendamentos_motorista" ON public.agendamentos_motorista FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert agendamentos_motorista" ON public.agendamentos_motorista FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update agendamentos_motorista" ON public.agendamentos_motorista FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete agendamentos_motorista" ON public.agendamentos_motorista FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. ANOTACOES: Auth required
DROP POLICY IF EXISTS "Allow delete anotacoes" ON public.anotacoes;
DROP POLICY IF EXISTS "Allow insert anotacoes" ON public.anotacoes;
DROP POLICY IF EXISTS "Allow read anotacoes" ON public.anotacoes;
DROP POLICY IF EXISTS "Allow update anotacoes" ON public.anotacoes;

CREATE POLICY "Auth select anotacoes" ON public.anotacoes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert anotacoes" ON public.anotacoes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update anotacoes" ON public.anotacoes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete anotacoes" ON public.anotacoes FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. AUTOMACOES: Auth required
DROP POLICY IF EXISTS "Allow delete automacoes" ON public.automacoes;
DROP POLICY IF EXISTS "Allow insert automacoes" ON public.automacoes;
DROP POLICY IF EXISTS "Allow read automacoes" ON public.automacoes;
DROP POLICY IF EXISTS "Allow update automacoes" ON public.automacoes;

CREATE POLICY "Auth select automacoes" ON public.automacoes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert automacoes" ON public.automacoes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update automacoes" ON public.automacoes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete automacoes" ON public.automacoes FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4. CAMPANHAS: Auth required
DROP POLICY IF EXISTS "Allow delete campanhas" ON public.campanhas;
DROP POLICY IF EXISTS "Allow insert campanhas" ON public.campanhas;
DROP POLICY IF EXISTS "Allow read campanhas" ON public.campanhas;
DROP POLICY IF EXISTS "Allow update campanhas" ON public.campanhas;

CREATE POLICY "Auth select campanhas" ON public.campanhas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert campanhas" ON public.campanhas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update campanhas" ON public.campanhas FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete campanhas" ON public.campanhas FOR DELETE USING (auth.uid() IS NOT NULL);

-- 5. COMUNICADORES: Auth required
DROP POLICY IF EXISTS "Allow delete comunicadores" ON public.comunicadores;
DROP POLICY IF EXISTS "Allow insert comunicadores" ON public.comunicadores;
DROP POLICY IF EXISTS "Allow read comunicadores" ON public.comunicadores;
DROP POLICY IF EXISTS "Allow update comunicadores" ON public.comunicadores;

CREATE POLICY "Auth select comunicadores" ON public.comunicadores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert comunicadores" ON public.comunicadores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update comunicadores" ON public.comunicadores FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete comunicadores" ON public.comunicadores FOR DELETE USING (auth.uid() IS NOT NULL);

-- 6. LEADS: Anonymous INSERT allowed (webhook), rest requires auth
DROP POLICY IF EXISTS "Allow delete leads" ON public.leads;
DROP POLICY IF EXISTS "Allow insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow read leads" ON public.leads;
DROP POLICY IF EXISTS "Allow update leads" ON public.leads;

CREATE POLICY "Auth select leads" ON public.leads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anon insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update leads" ON public.leads FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete leads" ON public.leads FOR DELETE USING (auth.uid() IS NOT NULL);

-- 7. MOTORISTA_VEICULOS: Auth required
DROP POLICY IF EXISTS "Allow delete motorista_veiculos" ON public.motorista_veiculos;
DROP POLICY IF EXISTS "Allow insert motorista_veiculos" ON public.motorista_veiculos;
DROP POLICY IF EXISTS "Allow read motorista_veiculos" ON public.motorista_veiculos;
DROP POLICY IF EXISTS "Allow update motorista_veiculos" ON public.motorista_veiculos;

CREATE POLICY "Auth select motorista_veiculos" ON public.motorista_veiculos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert motorista_veiculos" ON public.motorista_veiculos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update motorista_veiculos" ON public.motorista_veiculos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete motorista_veiculos" ON public.motorista_veiculos FOR DELETE USING (auth.uid() IS NOT NULL);

-- 8. MOTORISTAS: Auth required
DROP POLICY IF EXISTS "Allow delete motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Allow insert motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Allow read motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Allow update motoristas" ON public.motoristas;

CREATE POLICY "Auth select motoristas" ON public.motoristas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert motoristas" ON public.motoristas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update motoristas" ON public.motoristas FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete motoristas" ON public.motoristas FOR DELETE USING (auth.uid() IS NOT NULL);

-- 9. PARCEIRO_VEICULOS: Auth required
DROP POLICY IF EXISTS "Allow delete parceiro_veiculos" ON public.parceiro_veiculos;
DROP POLICY IF EXISTS "Allow insert parceiro_veiculos" ON public.parceiro_veiculos;
DROP POLICY IF EXISTS "Allow read parceiro_veiculos" ON public.parceiro_veiculos;
DROP POLICY IF EXISTS "Allow update parceiro_veiculos" ON public.parceiro_veiculos;

CREATE POLICY "Auth select parceiro_veiculos" ON public.parceiro_veiculos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert parceiro_veiculos" ON public.parceiro_veiculos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update parceiro_veiculos" ON public.parceiro_veiculos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete parceiro_veiculos" ON public.parceiro_veiculos FOR DELETE USING (auth.uid() IS NOT NULL);

-- 10. PARCEIROS: Auth required
DROP POLICY IF EXISTS "Allow delete parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "Allow insert parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "Allow read parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "Allow update parceiros" ON public.parceiros;

CREATE POLICY "Auth select parceiros" ON public.parceiros FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert parceiros" ON public.parceiros FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update parceiros" ON public.parceiros FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete parceiros" ON public.parceiros FOR DELETE USING (auth.uid() IS NOT NULL);

-- 11. RESERVAS_TRANSFER: Auth required
DROP POLICY IF EXISTS "Allow delete reservas" ON public.reservas_transfer;
DROP POLICY IF EXISTS "Allow insert reservas" ON public.reservas_transfer;
DROP POLICY IF EXISTS "Allow read all reservas" ON public.reservas_transfer;
DROP POLICY IF EXISTS "Allow update reservas" ON public.reservas_transfer;

CREATE POLICY "Auth select reservas_transfer" ON public.reservas_transfer FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert reservas_transfer" ON public.reservas_transfer FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update reservas_transfer" ON public.reservas_transfer FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete reservas_transfer" ON public.reservas_transfer FOR DELETE USING (auth.uid() IS NOT NULL);

-- 12. SOLICITACOES_MOTORISTA: Anonymous INSERT (webhook), rest auth
DROP POLICY IF EXISTS "Allow delete solicitacoes_motorista" ON public.solicitacoes_motorista;
DROP POLICY IF EXISTS "Allow insert solicitacoes_motorista" ON public.solicitacoes_motorista;
DROP POLICY IF EXISTS "Allow read solicitacoes_motorista" ON public.solicitacoes_motorista;
DROP POLICY IF EXISTS "Allow update solicitacoes_motorista" ON public.solicitacoes_motorista;

CREATE POLICY "Auth select solicitacoes_motorista" ON public.solicitacoes_motorista FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anon insert solicitacoes_motorista" ON public.solicitacoes_motorista FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update solicitacoes_motorista" ON public.solicitacoes_motorista FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete solicitacoes_motorista" ON public.solicitacoes_motorista FOR DELETE USING (auth.uid() IS NOT NULL);

-- 13. SOLICITACOES_TRANSFER: Anonymous INSERT (webhook), rest auth
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.solicitacoes_transfer;
DROP POLICY IF EXISTS "Allow delete solicitacoes" ON public.solicitacoes_transfer;
DROP POLICY IF EXISTS "Allow read all" ON public.solicitacoes_transfer;
DROP POLICY IF EXISTS "Allow update all" ON public.solicitacoes_transfer;

CREATE POLICY "Auth select solicitacoes_transfer" ON public.solicitacoes_transfer FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anon insert solicitacoes_transfer" ON public.solicitacoes_transfer FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update solicitacoes_transfer" ON public.solicitacoes_transfer FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete solicitacoes_transfer" ON public.solicitacoes_transfer FOR DELETE USING (auth.uid() IS NOT NULL);

-- 14. SUBPARCEIROS: Auth required
DROP POLICY IF EXISTS "Allow delete subparceiros" ON public.subparceiros;
DROP POLICY IF EXISTS "Allow insert subparceiros" ON public.subparceiros;
DROP POLICY IF EXISTS "Allow read subparceiros" ON public.subparceiros;
DROP POLICY IF EXISTS "Allow update subparceiros" ON public.subparceiros;

CREATE POLICY "Auth select subparceiros" ON public.subparceiros FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert subparceiros" ON public.subparceiros FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update subparceiros" ON public.subparceiros FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete subparceiros" ON public.subparceiros FOR DELETE USING (auth.uid() IS NOT NULL);

-- 15. SYSTEM_SETTINGS: Auth required
DROP POLICY IF EXISTS "Allow delete system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow insert system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow update system_settings" ON public.system_settings;

CREATE POLICY "Auth select system_settings" ON public.system_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert system_settings" ON public.system_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update system_settings" ON public.system_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete system_settings" ON public.system_settings FOR DELETE USING (auth.uid() IS NOT NULL);

-- 16. TRACKING_LINKS: Anonymous SELECT/UPDATE needed for tracking page, auth for rest
DROP POLICY IF EXISTS "Allow delete tracking_links" ON public.tracking_links;
DROP POLICY IF EXISTS "Allow insert tracking_links" ON public.tracking_links;
DROP POLICY IF EXISTS "Allow read tracking_links" ON public.tracking_links;
DROP POLICY IF EXISTS "Allow update tracking_links" ON public.tracking_links;

CREATE POLICY "Anon select tracking_links" ON public.tracking_links FOR SELECT USING (true);
CREATE POLICY "Auth insert tracking_links" ON public.tracking_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Anon update tracking_links" ON public.tracking_links FOR UPDATE USING (true);
CREATE POLICY "Auth delete tracking_links" ON public.tracking_links FOR DELETE USING (auth.uid() IS NOT NULL);

-- 17. WEBHOOK_TESTS: Auth required
DROP POLICY IF EXISTS "Allow delete webhook_tests" ON public.webhook_tests;
DROP POLICY IF EXISTS "Allow insert webhook_tests" ON public.webhook_tests;
DROP POLICY IF EXISTS "Allow read webhook_tests" ON public.webhook_tests;

CREATE POLICY "Auth select webhook_tests" ON public.webhook_tests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert webhook_tests" ON public.webhook_tests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete webhook_tests" ON public.webhook_tests FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- FIX STORAGE: Make sensitive buckets private
-- =====================================================
UPDATE storage.buckets SET public = false WHERE id IN ('motorista-documentos', 'parceiro-documentos', 'webhook-uploads');

-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Allow public read motorista docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload motorista docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read parceiro docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload parceiro docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read webhook uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload webhook uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload logos" ON storage.objects;

-- Drop any generic policies that might exist
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Create auth-based storage policies for motorista-documentos
CREATE POLICY "Auth read motorista docs" ON storage.objects FOR SELECT USING (bucket_id = 'motorista-documentos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth upload motorista docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'motorista-documentos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update motorista docs" ON storage.objects FOR UPDATE USING (bucket_id = 'motorista-documentos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete motorista docs" ON storage.objects FOR DELETE USING (bucket_id = 'motorista-documentos' AND auth.uid() IS NOT NULL);

-- Create auth-based storage policies for parceiro-documentos
CREATE POLICY "Auth read parceiro docs" ON storage.objects FOR SELECT USING (bucket_id = 'parceiro-documentos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth upload parceiro docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'parceiro-documentos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update parceiro docs" ON storage.objects FOR UPDATE USING (bucket_id = 'parceiro-documentos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete parceiro docs" ON storage.objects FOR DELETE USING (bucket_id = 'parceiro-documentos' AND auth.uid() IS NOT NULL);

-- webhook-uploads: Service role handles uploads via edge function, auth for reads
CREATE POLICY "Auth read webhook uploads" ON storage.objects FOR SELECT USING (bucket_id = 'webhook-uploads' AND auth.uid() IS NOT NULL);

-- Logos bucket: public read, auth for write
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Auth upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
