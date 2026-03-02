
-- Table for tracking links
CREATE TABLE public.tracking_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id uuid REFERENCES public.reservas_transfer(id) ON DELETE CASCADE,
  token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') UNIQUE,
  cliente_nome text,
  cliente_telefone text,
  categoria text NOT NULL DEFAULT 'cliente',
  observacoes text,
  status text NOT NULL DEFAULT 'pendente',
  latitude double precision,
  longitude double precision,
  last_location_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read tracking_links" ON public.tracking_links FOR SELECT USING (true);
CREATE POLICY "Allow insert tracking_links" ON public.tracking_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update tracking_links" ON public.tracking_links FOR UPDATE USING (true);
CREATE POLICY "Allow delete tracking_links" ON public.tracking_links FOR DELETE USING (true);

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_links;
