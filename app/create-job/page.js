"use client";
import { useState } from "react";

export default function CreateJob() {
  const [location, setLocation] = useState({ lat: "", lng: "" });

  // ฟังก์ชันดึงพิกัดจากมือถือ (GPS)
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

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>📋 เปิดงานซ่อมท่อใหม่</h2>
      <hr />
      
      <div style={{ marginBottom: "15px" }}>
        <label>ลักษณะที่แตก/ชำรุด:</label>
        <select style={{ width: "100%", padding: "10px", marginTop: "5px" }}>
          <option>ท่อแตกรั่ว</option>
          <option>น้ำไหลอ่อน/ไม่ไหล</option>
          <option>ประตูน้ำชำรุด</option>
          <option>มาตรวัดน้ำชำรุด</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>ที่อยู่คราวๆ:</label>
        <textarea placeholder="เช่น หน้าบ้านเลขที่... หรือ ใกล้โรงเรียน..." 
          style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
      </div>

      <button onClick={getMyLocation} 
        style={{ width: "100%", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", marginBottom: "10px" }}>
        📍 ปักพิกัดตำแหน่งปัจจุบัน
      </button>
      
      <p>พิกัด: {location.lat}, {location.lng}</p>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input type="checkbox" id="urgent" style={{ transform: "scale(1.5)" }} />
        <label htmlFor="urgent" style={{ color: "red", fontWeight: "bold" }}>⚠️ งานด่วน!</label>
      </div>

      <button style={{ width: "100%", padding: "15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", marginTop: "20px", fontSize: "18px" }}>
        ส่งข้อมูลเปิดงาน
      </button>
    </div>
  );
}
