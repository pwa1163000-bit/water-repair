"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// 💡 ใช้ Dynamic Import เพื่อป้องกัน Error "window is not defined" ใน Next.js
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import("react-leaflet-cluster"), { ssr: false });

export default function MapPage() {
  const [jobs, setJobs] = useState([]);
  const [L, setL] = useState(null);

  // โหลด Leaflet Library เฉพาะฝั่ง Client
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
    });
    return () => unsubscribe();
  }, []);

  // ฟังก์ชันเลือกสีหมุด
  const getCustomIcon = (status) => {
    if (!L) return null;
    let color = "blue";
    if (status === "รอซ่อม") color = "red";
    if (status === "กำลังซ่อม") color = "orange";
    if (status === "เสร็จแล้ว") color = "green";

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  if (!L) return <p style={{ padding: 20 }}>กำลังโหลดระบบแผนที่...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "22px", marginBottom: "15px" }}>🗺️ แผนที่ภาพรวมจุดแจ้งซ่อม (PWA)</h1>
      
      <div style={{ height: "80vh", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd" }}>
        <MapContainer center={[14.5655, 100.7196]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* 🟢 ระบบ Marker Cluster จะรวมกลุ่มหมุดที่อยู่ใกล้กันให้อัตโนมัติ */}
          <MarkerClusterGroup>
            {jobs.map((job) => (
              job.location && (
                <Marker 
                  key={job.id} 
                  position={[job.location.lat, job.location.lng]} 
                  icon={getCustomIcon(job.status)}
                >
                  <Popup>
                    <div style={{ minWidth: "150px" }}>
                      <p><b>เลขงาน:</b> {job.jobNo}</p>
                      <p><b>สถานะ:</b> <span style={{ color: job.status === "รอซ่อม" ? "red" : "green" }}>{job.status}</span></p>
                      <p><b>รายละเอียด:</b> {job.title}</p>
                      <hr />
                      <a 
                        href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: "#0070f3", textDecoration: "none" }}
                      >
                        📍 นำทางด้วย Google Maps
                      </a>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
