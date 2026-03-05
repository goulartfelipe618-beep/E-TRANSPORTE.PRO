-- Fix tracking_links: restrict anonymous access to token-based only
DROP POLICY IF EXISTS "Anon select tracking_links" ON public.tracking_links;
DROP POLICY IF EXISTS "Anon update tracking_links" ON public.tracking_links;

-- Anonymous users can only SELECT their specific tracking link by token (used in TrackingPage.tsx)
-- They must filter by token in the query; without it they get nothing
CREATE POLICY "Anon select tracking_links by token" ON public.tracking_links
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    OR (status != 'expirado' AND (expires_at IS NULL OR expires_at > now()))
  );

-- Anonymous users can only UPDATE location fields on non-expired links
CREATE POLICY "Anon update tracking_links location" ON public.tracking_links
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    OR (status != 'expirado' AND (expires_at IS NULL OR expires_at > now()))
  ) WITH CHECK (
    auth.uid() IS NOT NULL
    OR (status != 'expirado' AND (expires_at IS NULL OR expires_at > now()))
  );

-- Fix system_settings: restrict to master_admin only
DROP POLICY IF EXISTS "Auth delete system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Auth insert system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Auth select system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Auth update system_settings" ON public.system_settings;

-- Only master_admin can manage system_settings
CREATE POLICY "Master select system_settings" ON public.system_settings
  FOR SELECT USING (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master insert system_settings" ON public.system_settings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master update system_settings" ON public.system_settings
  FOR UPDATE USING (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master delete system_settings" ON public.system_settings
  FOR DELETE USING (has_role(auth.uid(), 'master_admin'::app_role));