
-- Allow authenticated users (admin) to read system_settings
CREATE POLICY "Auth read system_settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users (admin) to update system_settings
CREATE POLICY "Auth update system_settings"
ON public.system_settings
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users (admin) to insert system_settings
CREATE POLICY "Auth insert system_settings"
ON public.system_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
