"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// 💡 โหลด Component แบบ Dynamic เพื่อรองรับ SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import("react-leaflet-cluster"), { ssr: false });

export default function MapPage() {
  const [jobs, setJobs] = useState([]);
  const [L, setL] = useState(null);

  useEffect(() => {
    // โหลด Leaflet Library เฉพาะฝั่ง Client
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });

    // ดึงข้อมูลแบบเรียงลำดับเวลาล่าสุด
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
    });

    return () => unsubscribe();
  }, []);

  // ฟังก์ชันเลือกสีหมุดตามสถานะ
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

  if (!L) return <div style={{ padding: "20px", textAlign: "center" }}>⏳ กำลังโหลดระบบแผนที่...</div>;

  return (
    <div style={{ padding: "10px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "10px", color: "#2c3e50" }}>
        📍 แผนที่จุดซ่อมท่อทั้งหมด (กปภ. ท่าเรือ)
      </h2>
      
      <div style={{ flex: 1, width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <MapContainer 
          center={[14.5655, 100.7196]} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          <MarkerClusterGroup>
            {jobs.map((job) => (
              job.location?.lat && job.location?.lng && (
                <Marker 
                  key={job.id} 
                  position={[job.location.lat, job.location.lng]} 
                  icon={getCustomIcon(job.status)}
                >
                  <Popup>
                    <div style={{ minWidth: "180px", fontFamily: "Sarabun, sans-serif" }}>
                      {/* แสดงรูปภาพถ้ามี */}
                      {job.imageUrl && (
                        <img 
                          src={job.imageUrl} 
                          alt="หน้างาน" 
                          style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }} 
                        />
                      )}
                      
                      <p style={{ margin: "2px 0" }}><b>เลขงาน:</b> {job.jobNo || "ไม่มีข้อมูล"}</p>
                      <p style={{ margin: "2px 0" }}>
                        <b>สถานะ:</b> 
                        <span style={{ 
                          color: job.status === "รอซ่อม" ? "#e74c3c" : 
                                 job.status === "กำลังซ่อม" ? "#f39c12" : "#2ecc71",
                          fontWeight: "bold",
                          marginLeft: "5px"
                        }}>
                          {job.status}
                        </span>
                      </p>
                      <p style={{ margin: "2px 0", fontSize: "13px" }}><b>รายละเอียด:</b> {job.title}</p>
                      
                      <hr style={{ border: "0.5px solid #eee", margin: "8px 0" }} />
                      
                      <a 
                        href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ 
                          display: "block",
                          textAlign: "center",
                          backgroundColor: "#4285F4",
                          color: "white",
                          padding: "8px",
                          borderRadius: "5px",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: "bold"
                        }}
                      >
                        🚗 นำทางด้วย Google Maps
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
