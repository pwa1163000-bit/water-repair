"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; // ตรวจสอบ path ให้ถูกตามโครงสร้างไฟล์คุณ
import { collection, onSnapshot } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// แก้ไข Bug ไอคอนไม่ขึ้น และแยกสีตามสถานะ
const getIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapPage() {
  const [jobs, setJobs] = useState([]);
  const position = [14.5655, 100.7196]; // พิกัดศูนย์กลาง (ท่าเรือ)

  useEffect(() => {
    // ดึงข้อมูลจาก Firebase แบบ Real-time
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(data);
    });
    return () => unsubscribe();
  }, []);

  const getColor = (status) => {
    if (status === "รอซ่อม") return "red";
    if (status === "กำลังซ่อม") return "orange";
    if (status === "เสร็จแล้ว") return "green";
    return "blue";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>🗺️ แผนที่จุดแจ้งซ่อมทั้งหมด</h1>
      <div style={{ height: "80vh", width: "100%", borderRadius: '15px', overflow: 'hidden', border: '1px solid #ccc' }}>
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {jobs.map((job) => (
            job.location && (
              <Marker 
                key={job.id} 
                position={[job.location.lat, job.location.lng]} 
                icon={getIcon(getColor(job.status))}
              >
                <Popup>
                  <div style={{ fontFamily: 'sans-serif' }}>
                    <p><b>เลขงาน:</b> {job.jobNo}</p>
                    <p><b>อาการ:</b> {job.title}</p>
                    <p><b>สถานะ:</b> <span style={{ color: getColor(job.status) }}>{job.status}</span></p>
                    <a href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} target="_blank">🔍 นำทางไปจุดนี้</a>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
