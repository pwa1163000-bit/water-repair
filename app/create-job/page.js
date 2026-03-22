"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic"; // เพิ่มตัวนี้มาช่วยแก้จอขาว

// 1. โหลด Map แบบ Dynamic (โหลดเฉพาะฝั่ง Client เท่านั้น)
const MapWithNoSSR = dynamic(
  () => import("../../components/MapPicker"), // เราจะแยกโค้ดแผนที่ไปไว้อีกไฟล์
  { 
    ssr: false,
    loading: () => <div style={{ height: "300px", backgroundColor: "#eee", textAlign: "center", paddingTop: "140px" }}>กำลังโหลดแผนที่...</div> 
  }
);

export default function CreateJob() {
  const router = useRouter();
  const [location, setLocation] = useState({ lat: 14.5826, lng: 100.6441 });
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("ท่อแตกรั่ว");
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!location.lat || !imageUrl) { alert("กรุณาระบุพิกัดและถ่ายรูปครับ"); return; }
    try {
      setUploading(true);
      await addDoc(collection(db, "jobs"), { 
        jobType, description, location, imageUrl, isUrgent, status: "รอซ่อม", createdAt: serverTimestamp() 
      });
      alert("ส่งงานสำเร็จ!");
      router.push("/dashboard"); 
    } finally { setUploading(false); }
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

  return (
    <div style={{ padding: "15px", maxWidth: "600px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3" }}>📋 เปิดงานซ่อม (กปภ.ท่าเรือ)</h2>
      <hr />

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>📍 เลือกจุดที่ท่อแตกบนแผนที่:</label>
        <div style={{ height: "300px", width: "100%", marginTop: "10px", borderRadius: "10px", overflow: "hidden", border: "2px solid #007bff" }}>
          {/* เรียกใช้ Component แผนที่ที่เราแยกไว้ */}
          <MapWithNoSSR location={location} setLocation={setLocation} />
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>ลักษณะที่แตก:</label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ width: "100%", padding: "12px" }}>
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
