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
  return (
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
  );
}
