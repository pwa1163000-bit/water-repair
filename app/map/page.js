"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ต้องแก้ Bug ไอคอนไม่ขึ้นใน Leaflet + Next.js เล็กน้อย
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LeafletMap() {
  const position = [14.5655, 100.7196]; // พิกัดท่าเรือ

  return (
    <MapContainer center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={position} icon={customIcon}>
        <Popup>จุดแจ้งซ่อม กปภ. สาขาท่าเรือ</Popup>
      </Marker>
    </MapContainer>
  );
}
