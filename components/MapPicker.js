"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// แก้ไข Icon หมุดให้แสดงผลถูกต้อง
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ส่วนประกอบสำหรับดักจับการคลิกบนแผนที่
function LocationMarker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      // เมื่อคลิกปุ๊บ ให้เปลี่ยนพิกัดเป็นจุดที่คลิกทันที
      setLocation(e.latlng);
    },
  });

  return location ? (
    <Marker position={location} icon={customIcon}></Marker>
  ) : null;
}

export default function MapPicker({ location, setLocation }) {
  return (
    <MapContainer
      center={location}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {/* เรียกใช้งานการปักหมุดเมื่อคลิก */}
      <LocationMarker location={location} setLocation={setLocation} />
    </MapContainer>
<MapPicker location={location} setLocation={setLocation} />
  );
}
