// components/MapPicker.js
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// แก้ไข Icon หมุด
const icon = L.icon({ 
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

export default function MapPicker({ location, setLocation }) {
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={[location.lat, location.lng]} icon={icon} />;
  }

  return (
    <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}
