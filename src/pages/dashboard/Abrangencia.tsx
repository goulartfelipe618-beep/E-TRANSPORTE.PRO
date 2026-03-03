import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const transferIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const voltaIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const grupoIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  type: "transfer_ida" | "transfer_volta" | "grupo";
  cliente: string;
}

export default function DashboardAbrangencia() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [reservasTransfer, setReservasTransfer] = useState<any[]>([]);
  const [reservasGrupos, setReservasGrupos] = useState<any[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      setLoading(true);
      const [rt, rg] = await Promise.all([
        supabase
          .from("reservas_transfer")
          .select("id, cliente_nome, tipo_viagem, ida_embarque, ida_embarque_lat, ida_embarque_lng, volta_embarque, volta_embarque_lat, volta_embarque_lng, status")
          .eq("tenant_id", tenantId),
        supabase
          .from("reservas_grupos")
          .select("id, cliente_nome, endereco_embarque, embarque_lat, embarque_lng, status")
          .eq("tenant_id", tenantId),
      ]);
      setReservasTransfer(rt.data ?? []);
      setReservasGrupos(rg.data ?? []);
      setLoading(false);
    };
    load();
  }, [tenantId]);

  // Geocode missing coordinates using Nominatim
  useEffect(() => {
    const geocodeAndUpdate = async () => {
      const toGeocode: { table: string; id: string; field: string; latField: string; lngField: string; address: string }[] = [];

      reservasTransfer.forEach((r) => {
        if (r.ida_embarque && !r.ida_embarque_lat) {
          toGeocode.push({ table: "reservas_transfer", id: r.id, field: "ida_embarque", latField: "ida_embarque_lat", lngField: "ida_embarque_lng", address: r.ida_embarque });
        }
        if (r.volta_embarque && !r.volta_embarque_lat) {
          toGeocode.push({ table: "reservas_transfer", id: r.id, field: "volta_embarque", latField: "volta_embarque_lat", lngField: "volta_embarque_lng", address: r.volta_embarque });
        }
      });

      reservasGrupos.forEach((r) => {
        if (r.endereco_embarque && !r.embarque_lat) {
          toGeocode.push({ table: "reservas_grupos", id: r.id, field: "endereco_embarque", latField: "embarque_lat", lngField: "embarque_lng", address: r.endereco_embarque });
        }
      });

      if (toGeocode.length === 0) {
        buildMarkers();
        return;
      }

      setGeocoding(true);
      const cache: Record<string, { lat: number; lng: number } | null> = {};

      for (const item of toGeocode) {
        const addr = item.address.trim();
        if (cache[addr] === undefined) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&countrycodes=br&limit=1`,
              { headers: { "User-Agent": "FleetDashboard/1.0" } }
            );
            const data = await res.json();
            if (data.length > 0) {
              cache[addr] = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            } else {
              cache[addr] = null;
            }
            // Respect Nominatim rate limit
            await new Promise((r) => setTimeout(r, 1100));
          } catch {
            cache[addr] = null;
          }
        }

        const coords = cache[addr];
        if (coords) {
          await supabase
            .from(item.table as any)
            .update({ [item.latField]: coords.lat, [item.lngField]: coords.lng } as any)
            .eq("id", item.id);
        }
      }

      // Reload data after geocoding
      if (tenantId) {
        const [rt, rg] = await Promise.all([
          supabase
            .from("reservas_transfer")
            .select("id, cliente_nome, tipo_viagem, ida_embarque, ida_embarque_lat, ida_embarque_lng, volta_embarque, volta_embarque_lat, volta_embarque_lng, status")
            .eq("tenant_id", tenantId),
          supabase
            .from("reservas_grupos")
            .select("id, cliente_nome, endereco_embarque, embarque_lat, embarque_lng, status")
            .eq("tenant_id", tenantId),
        ]);
        setReservasTransfer(rt.data ?? []);
        setReservasGrupos(rg.data ?? []);
      }
      setGeocoding(false);
    };

    if (!loading && (reservasTransfer.length > 0 || reservasGrupos.length > 0)) {
      geocodeAndUpdate();
    } else if (!loading) {
      setMarkers([]);
    }
  }, [loading, reservasTransfer.length, reservasGrupos.length]);

  const buildMarkers = () => {
    const m: MapMarker[] = [];

    reservasTransfer.forEach((r) => {
      if (r.ida_embarque_lat && r.ida_embarque_lng) {
        m.push({
          lat: r.ida_embarque_lat,
          lng: r.ida_embarque_lng,
          label: r.ida_embarque || "Embarque Ida",
          type: "transfer_ida",
          cliente: r.cliente_nome || "N/A",
        });
      }
      if (r.volta_embarque_lat && r.volta_embarque_lng) {
        m.push({
          lat: r.volta_embarque_lat,
          lng: r.volta_embarque_lng,
          label: r.volta_embarque || "Embarque Volta",
          type: "transfer_volta",
          cliente: r.cliente_nome || "N/A",
        });
      }
    });

    reservasGrupos.forEach((r) => {
      if (r.embarque_lat && r.embarque_lng) {
        m.push({
          lat: r.embarque_lat,
          lng: r.embarque_lng,
          label: r.endereco_embarque || "Embarque Grupo",
          type: "grupo",
          cliente: r.cliente_nome || "N/A",
        });
      }
    });

    setMarkers(m);
  };

  useEffect(() => {
    if (!geocoding && !loading) {
      buildMarkers();
    }
  }, [reservasTransfer, reservasGrupos, geocoding, loading]);

  const totalMarkers = markers.length;
  const transferIda = markers.filter((m) => m.type === "transfer_ida").length;
  const transferVolta = markers.filter((m) => m.type === "transfer_volta").length;
  const grupos = markers.filter((m) => m.type === "grupo").length;

  const getIcon = (type: string) => {
    switch (type) {
      case "transfer_ida": return transferIcon;
      case "transfer_volta": return voltaIcon;
      case "grupo": return grupoIcon;
      default: return transferIcon;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "transfer_ida": return "Transfer (Ida)";
      case "transfer_volta": return "Transfer (Volta)";
      case "grupo": return "Grupo";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abrangência</h1>
        <p className="text-muted-foreground">
          Mapa com pontos de embarque de todas as reservas
          {geocoding && (
            <span className="ml-2 inline-flex items-center gap-1 text-primary">
              <Loader2 className="h-3 w-3 animate-spin" /> Geocodificando endereços...
            </span>
          )}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total no Mapa</p>
            <p className="text-xl font-bold">{totalMarkers}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <p className="text-xs text-muted-foreground">Transfer Ida</p>
            </div>
            <p className="text-xl font-bold">{transferIda}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <p className="text-xs text-muted-foreground">Transfer Volta</p>
            </div>
            <p className="text-xl font-bold">{transferVolta}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <p className="text-xs text-muted-foreground">Grupos</p>
            </div>
            <p className="text-xl font-bold">{grupos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height: "550px", width: "100%" }}>
            <MapContainer
              center={[-14.235, -51.9253]}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markers.map((marker, i) => (
                <Marker key={i} position={[marker.lat, marker.lng]} icon={getIcon(marker.type)}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">{getTypeLabel(marker.type)}</p>
                      <p className="text-muted-foreground">{marker.label}</p>
                      <p>Cliente: <strong>{marker.cliente}</strong></p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png" alt="" className="h-5" />
          <span>Transfer (Embarque Ida)</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" alt="" className="h-5" />
          <span>Transfer (Embarque Volta)</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="" className="h-5" />
          <span>Grupo (Embarque)</span>
        </div>
      </div>
    </div>
  );
}
