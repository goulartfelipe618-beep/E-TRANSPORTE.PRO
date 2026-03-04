import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export const transferIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export const voltaIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export const grupoIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  type: "transfer_ida" | "transfer_volta" | "grupo";
  cliente: string;
}

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

export default function AbrangenciaMap({ markers }: { markers: MapMarker[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-14.235, -51.9253], 4);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: getIcon(marker.type),
      }).addTo(map);

      leafletMarker.bindPopup(`
        <div style="font-size:13px;">
          <p style="font-weight:600;margin:0 0 4px">${getTypeLabel(marker.type)}</p>
          <p style="color:#888;margin:0 0 4px">${marker.label}</p>
          <p style="margin:0">Cliente: <strong>${marker.cliente}</strong></p>
        </div>
      `);
    });
  }, [markers]);

  return (
    <div ref={containerRef} style={{ height: "550px", width: "100%" }} />
  );
}
