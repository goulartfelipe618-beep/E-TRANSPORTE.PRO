
-- Add embarque info to tracking_links for displaying pickup point
ALTER TABLE public.tracking_links ADD COLUMN IF NOT EXISTS embarque_endereco text;

-- Add reference for grupo reservations (nullable FK)
ALTER TABLE public.tracking_links ADD COLUMN IF NOT EXISTS reserva_grupo_id uuid REFERENCES public.reservas_grupos(id) ON DELETE SET NULL;
