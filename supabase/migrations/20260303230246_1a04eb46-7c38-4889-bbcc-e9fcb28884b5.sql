
-- Add lat/lng columns to reservas_transfer for embarkation points
ALTER TABLE public.reservas_transfer
  ADD COLUMN IF NOT EXISTS ida_embarque_lat double precision,
  ADD COLUMN IF NOT EXISTS ida_embarque_lng double precision,
  ADD COLUMN IF NOT EXISTS volta_embarque_lat double precision,
  ADD COLUMN IF NOT EXISTS volta_embarque_lng double precision;

-- Add lat/lng columns to reservas_grupos for embarkation point
ALTER TABLE public.reservas_grupos
  ADD COLUMN IF NOT EXISTS embarque_lat double precision,
  ADD COLUMN IF NOT EXISTS embarque_lng double precision;
