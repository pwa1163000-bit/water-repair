"use client";
import { useState } from "react";

export default function CreateJob() {
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("ท่อแตกรั่ว");
  const [isUrgent, setIsUrgent] = useState(false);
  
  // สำหรับระบบรูปภาพ ImgBB
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // 1. ฟังก์ชันดึงพิกัด (GPS)
  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("ปักหมุดสำเร็จ!");
      });
    } else {
      alert("มือถือของคุณไม่รองรับการดึงพิกัด");
    }
  };

  // 2. ฟังก์ชันส่งรูปไป ImgBB
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    // *** อย่าลืมเปลี่ยนเป็น API KEY ของคุณจากเว็บ ImgBB ***
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

  // 3. ฟังก์ชันส่งข้อมูลรวม (จะเชื่อมต่อ Firebase ในขั้นถัดไป)
  const handleSubmit = () => {
    if (!location.lat || !imageUrl) {
      alert("กรุณาปักพิกัดและถ่ายรูปก่อนส่งงานครับ");
      return;
    }
    
    console.log("ข้อมูลที่พร้อมส่ง:", {
      jobType,
      description,
      location,
      imageUrl,
      isUrgent,
      timestamp: new Date()
    });
    
    alert("ข้อมูลพร้อมส่ง! (ขั้นตอนถัดไปเราจะบันทึกลง Firebase)");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3" }}>📋 เปิดงานซ่อมท่อใหม่</h2>
      <hr />
      
      {/* ส่วนที่ 1: รายละเอียด */}
      <div style={{ marginBottom: "15px" }}>
        <label>ลักษณะที่แตก/ชำรุด:</label>
        <select 
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc" }}
        >
          <option>ท่อแตกรั่ว</option>
          <option>น้ำไหลอ่อน/ไม่ไหล</option>
          <option>ประตูน้ำชำรุด</option>
          <option>มาตรวัดน้ำชำรุด</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>ที่อยู่ / จุดสังเกตคราวๆ:</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="เช่น หน้าบ้านเลขที่... หรือ ใกล้โรงเรียน..." 
          style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc", height: "80px" }} 
        />
      </div>

      {/* ส่วนที่ 2: รูปภาพ */}
      <div style={{ marginBottom: "15px", border: "2px dashed #007bff", padding: "15px", borderRadius: "10px", textAlign: "center", backgroundColor: "#f8f9fa" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>📷 ถ่ายรูปสภาพหน้างาน:</label>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleUploadImage}
          style={{ marginBottom: "10px" }}
        />
        {uploading && <p style={{ color: "orange" }}>กำลังอัปโหลดรูป...</p>}
        {imageUrl &&
