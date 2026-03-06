import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface TrackingData {
  valid: boolean;
  status: string;
  cliente_nome: string | null;
  embarque_endereco: string | null;
  embarque_lat: number | null;
  embarque_lng: number | null;
}

export default function TrackingPage() {
  const [status, setStatus] = useState<"loading" | "invalid" | "expired" | "ready" | "active" | "error">("loading");
  const [message, setMessage] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const token = window.location.pathname.split("/rastreamento/")[1];

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    await supabase.functions.invoke("tracking", {
      body: { action: "update_location", token, latitude: lat, longitude: lng },
    });
  }, [token]);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    const init = async () => {
      const { data, error } = await supabase.functions.invoke("tracking", {
        body: { action: "get", token },
      });

      if (error || !data?.valid) {
        if (data?.error === "Link expired") {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
        return;
      }

      setTrackingData(data as TrackingData);

      if (!navigator.geolocation) {
        setStatus("error");
        setMessage("Seu navegador não suporta geolocalização.");
        return;
      }

      setStatus("ready");
    };

    init();

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token]);

  const handleStartTrip = () => {
    setStatus("active");

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos([latitude, longitude]);
        latestPosRef.current = { lat: latitude, lng: longitude };
      },
      () => {
        setMessage("Permita o acesso à localização para continuar.");
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    watchIdRef.current = id;

    // Send location every 5 seconds
    intervalRef.current = setInterval(() => {
      if (latestPosRef.current) {
        updateLocation(latestPosRef.current.lat, latestPosRef.current.lng);
      }
    }, 5000);
  };

  const hasPickupCoords = trackingData?.embarque_lat && trackingData?.embarque_lng;
  const pickupCenter: [number, number] | null = hasPickupCoords
    ? [trackingData!.embarque_lat!, trackingData!.embarque_lng!]
    : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-800">
        <div className="text-2xl mb-1">📍</div>
        <h1 className="text-lg font-bold">
          {status === "loading" && "Carregando..."}
          {status === "invalid" && "Link inválido"}
          {status === "expired" && "Link expirado"}
          {status === "ready" && `Olá${trackingData?.cliente_nome ? `, ${trackingData.cliente_nome}` : ""}!`}
          {status === "active" && "Compartilhando localização"}
          {status === "error" && "Erro"}
        </h1>
        {status === "invalid" && (
          <p className="text-gray-400 text-sm">Este link de rastreamento não existe ou foi removido.</p>
        )}
        {status === "expired" && (
          <p className="text-gray-400 text-sm">Este link de rastreamento expirou. Solicite um novo link.</p>
        )}
        {status === "error" && (
          <p className="text-gray-400 text-sm">{message}</p>
        )}
        {status === "ready" && (
          <p className="text-gray-400 text-sm">
            {trackingData?.embarque_endereco
              ? `Ponto de embarque: ${trackingData.embarque_endereco}`
              : "Aguardando início da corrida"}
          </p>
        )}
        {status === "active" && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Localização ativa</span>
          </div>
        )}
        {message && status === "active" && (
          <p className="text-amber-400 text-sm mt-1">{message}</p>
        )}
      </div>

      {/* Map */}
      {(status === "ready" || status === "active") && (
        <div className="flex-1 relative" style={{ minHeight: "400px" }}>
          {(pickupCenter || currentPos) ? (
            <MapContainer
              center={currentPos || pickupCenter || [-23.55, -46.63]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Pickup point marker */}
              {pickupCenter && (
                <Marker position={pickupCenter} icon={pickupIcon}>
                  <Popup>
                    <strong>Ponto de Embarque</strong>
                    <br />
                    {trackingData?.embarque_endereco || "Local de embarque"}
                  </Popup>
                </Marker>
              )}

              {/* Current location marker */}
              {currentPos && (
                <>
                  <MapUpdater center={currentPos} />
                  <Marker position={currentPos}>
                    <Popup>Sua localização atual</Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-900">
              <p className="text-gray-500">Mapa não disponível — coordenadas do embarque não encontradas.</p>
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      {status === "ready" && (
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleStartTrip}
            className="w-full py-4 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 transition-colors text-white"
          >
            🚗 Iniciar Corrida
          </button>
          <p className="text-gray-500 text-xs text-center mt-2">
            Ao iniciar, sua localização será compartilhada em tempo real com o operador.
          </p>
        </div>
      )}
    </div>
  );
}
