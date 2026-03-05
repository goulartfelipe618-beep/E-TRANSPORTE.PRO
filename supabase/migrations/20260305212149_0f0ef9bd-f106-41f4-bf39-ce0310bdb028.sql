-- Remove broad anonymous access to tracking_links
-- Now all anonymous access goes through the tracking edge function (service role)
DROP POLICY IF EXISTS "Anon select tracking_links by token" ON public.tracking_links;
DROP POLICY IF EXISTS "Anon update tracking_links location" ON public.tracking_links;

-- Only authenticated users (admins) can access tracking_links directly
CREATE POLICY "Auth select tracking_links" ON public.tracking_links
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth update tracking_links" ON public.tracking_links
  FOR UPDATE USING (auth.uid() IS NOT NULL);