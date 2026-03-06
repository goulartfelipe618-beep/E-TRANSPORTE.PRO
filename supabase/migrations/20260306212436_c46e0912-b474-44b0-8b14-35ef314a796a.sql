
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  nome_completo text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  setup_complete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users select own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master select all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role));
