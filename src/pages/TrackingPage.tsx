import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function TrackingPage() {
  const [status, setStatus] = useState<"loading" | "invalid" | "expired" | "active" | "error">("loading");
  const [message, setMessage] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);

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

      if (!navigator.geolocation) {
        setStatus("error");
        setMessage("Seu navegador não suporta geolocalização.");
        return;
      }

      setStatus("active");

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setMessage("Permita o acesso à localização para continuar.");
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      setWatchId(id);
    };

    init();

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-4xl">📍</div>
        {status === "loading" && <p className="text-gray-400">Carregando...</p>}
        {status === "invalid" && (
          <>
            <h1 className="text-xl font-bold">Link inválido</h1>
            <p className="text-gray-400">Este link de rastreamento não existe ou foi removido.</p>
          </>
        )}
        {status === "expired" && (
          <>
            <h1 className="text-xl font-bold">Link expirado</h1>
            <p className="text-gray-400">Este link de rastreamento expirou. Solicite um novo link.</p>
          </>
        )}
        {status === "active" && (
          <>
            <h1 className="text-xl font-bold">Compartilhando localização</h1>
            <p className="text-gray-400">Sua localização está sendo compartilhada em tempo real. Mantenha esta página aberta durante a viagem.</p>
            <div className="animate-pulse">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto" />
            </div>
            {message && <p className="text-amber-400 text-sm">{message}</p>}
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold">Erro</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
