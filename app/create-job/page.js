"use client";
import { useState } from "react";
import { db } from "../../lib/firebase; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateJob() {
  const router = useRouter();
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("ท่อแตกรั่ว");
  const [isUrgent, setIsUrgent] = useState(false);
  
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("ปักหมุดสำเร็จ!");
      }, (error) => {
        alert("กรุณาเปิด GPS บนมือถือของท่าน");
      });
    } else {
      alert("มือถือของคุณไม่รองรับการดึงพิกัด");
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
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.data.url);
        alert("อัปโหลดรูปภาพเรียบร้อย!");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการโหลดรูป");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!location.lat || !imageUrl) {
      alert("กรุณาปักพิกัดและถ่ายรูปก่อนส่งงานครับ");
      return;
    }
    try {
      setUploading(true);
      await addDoc(collection(db, "jobs"), {
        jobType,
        description,
        location,
        imageUrl,
        isUrgent,
        status: "รอซ่อม",
        createdAt: serverTimestamp(),
      });
      alert("ส่งงานเข้าสู่ระบบสำเร็จ!");
      router.push("/dashboard"); 
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3" }}>📋 เปิดงานซ่อมท่อใหม่</h2>
      <hr />
      <div style={{ marginBottom: "15px" }}>
        <label>ลักษณะที่แตก/ชำรุด:</label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)}
          style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc" }}>
          <option>ท่อแตกรั่ว</option>
          <option>น้ำไหลอ่อน/ไม่ไหล</option>
          <option>ประตูน้ำชำรุด</option>
          <option>มาตรวัดน้ำชำรุด</option>
        </select>
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label>ที่อยู่ / จุดสังเกตคราวๆ:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="เช่น หน้าบ้านเลขที่... หรือ ใกล้โรงเรียน..." 
          style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc", height: "80px" }} />
      </div>
      <div style={{ marginBottom: "15px", border: "2px dashed #007bff", padding: "15px", borderRadius: "10px", textAlign: "center", backgroundColor: "#f8f9fa" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>📷 ถ่ายรูปสภาพหน้างาน:</label>
        <input type="file" accept="image/*" capture="environment" onChange={handleUploadImage} style={{ marginBottom: "10px" }} />
        {uploading && <p style={{ color: "orange" }}>กำลังดำเนินการ...</p>}
        {imageUrl && <img src={imageUrl} alt="preview" style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }} />}
      </div>
      <button onClick={getMyLocation} 
        style={{ width: "100%", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", marginBottom: "10px", fontWeight: "bold" }}>
        📍 ปักพิกัดตำแหน่งปัจจุบัน
      </button>
      <p style={{ fontSize: "14px", color: "#666" }}>พิกัด: {location.lat || "-"}, {location.lng || "-"}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff3f3", padding: "10px", borderRadius: "8px" }}>
        <input type="checkbox" id="urgent" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} style={{ transform: "scale(1.5)" }} />
        <label htmlFor="urgent" style={{ color: "red", fontWeight: "bold" }}>⚠️ งานด่วน (ต้องรีบเข้าซ่อมทันที)</label>
      </div>
      <button onClick={handleSubmit} disabled={uploading}
        style={{ width: "100%", padding: "18px", backgroundColor: uploading ? "#ccc" : "#28a745", color: "white", border: "none", borderRadius: "8px", marginTop: "20px", fontSize: "20px", fontWeight: "bold", cursor: "pointer" }}>
        {uploading ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลเปิดงานให้ทีมซ่อม"}
      </button>
    </div>
  );
}
