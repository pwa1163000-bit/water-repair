// components/MapPicker.js
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function MapPicker({ location, setLocation }) {
  // 1. ตรวจสอบว่ารันบน Browser หรือไม่ (ป้องกัน Error Window is not defined)
  if (typeof window === "undefined") return null;

  // 2. ตั้งค่า Icon ของหมุด (ถ้าไม่ใส่ หมุดจะไม่ขึ้นรูป)
  const icon = L.icon({ 
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", 
    iconSize: [25, 41], 
    iconAnchor: [12, 41] 
  });

  // 3. ฟังก์ชันสำหรับคลิกที่แผนที่เพื่อย้ายหมุด
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={[location.lat, location.lng]} icon={icon} />;
  }

  return (
    <MapContainer 
      center={[location.lat, location.lng]} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}
