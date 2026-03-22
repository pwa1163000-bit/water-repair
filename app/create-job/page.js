"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
// นำเข้า Leaflet (แผนที่ฟรี)
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// แก้ไข Icon หมุดให้แสดงผลถูกต้อง
const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] });

export default function CreateJob() {
  const router = useRouter();
  const [location, setLocation] = useState({ lat: 14.5826, lng: 100.6441 }); // ค่าเริ่มต้นแถวท่าเรือ
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("ท่อแตกรั่ว");
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // ส่วนประกอบสำหรับ "คลิกแล้วหมุดย้ายตาม"
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return location.lat ? <Marker position={[location.lat, location.lng]} icon={icon} /> : null;
  }

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const apiKey = "64e2261d33f516b0a748c0d7fb105e2e"; 
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setImageUrl(data.data.url);
    } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!location.lat || !imageUrl) { alert("กรุณาระบุพิกัดและถ่ายรูปครับ"); return; }
    try {
      setUploading(true);
      await addDoc(collection(db, "jobs"), { jobType, description, location, imageUrl, isUrgent, status: "รอซ่อม", createdAt: serverTimestamp() });
      alert("ส่งงานสำเร็จ!");
      router.push("/dashboard"); 
    } finally { setUploading(false); }
  };

  return (
    <div style={{ padding: "15px", maxWidth: "600px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3" }}>📋 เปิดงานซ่อม (กปภ.ท่าเรือ)</h2>
      <hr />

      {/* แผนที่สำหรับจิ้มเลือกจุด */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>📍 เลือกจุดที่ท่อแตกบนแผนที่ (จิ้มเพื่อย้ายหมุด):</label>
        <div style={{ height: "300px", width: "100%", marginTop: "10px", borderRadius: "10px", overflow: "hidden", border: "2px solid #007bff" }}>
          <MapContainer center={[14.5826, 100.6441]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        </div>
        <button onClick={getMyLocation} style={{ width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#f8f9fa", border: "1px solid #ccc", borderRadius: "5px" }}>
          🎯 ใช้พิกัดปัจจุบันของฉัน
        </button>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>ลักษณะที่แตก:</label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ width: "100%", padding: "12px", marginTop: "5px" }}>
          <option>ท่อแตกรั่ว</option>
          <option>น้ำไม่ไหล</option>
          <option>ประตูน้ำชำรุด</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>จุดสังเกต/ที่อยู่:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "10px", height: "60px" }} />
      </div>

      <div style={{ marginBottom: "15px", border: "2px dashed #ccc", padding: "10px", textAlign: "center" }}>
        <input type="file" accept="image/*" capture="environment" onChange={handleUploadImage} />
        {imageUrl && <img src={imageUrl} alt="preview" style={{ width: "100%", marginTop: "10px" }} />}
      </div>

      <button onClick={handleSubmit} disabled={uploading} style={{ width: "100%", padding: "15px", backgroundColor: "#28a745", color: "white", fontSize: "18px", borderRadius: "8px", border: "none" }}>
        {uploading ? "กำลังส่ง..." : "ยืนยันการเปิดงาน"}
      </button>
    </div>
  );
}
