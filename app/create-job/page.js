"use client";

import { useState } from "react";
import { db } from "../../lib/firebase"; // ตรวจสอบว่า Path ถูกต้อง
import {
  collection,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันรันเลขที่งานอัตโนมัติ (เช่น 001/69)
  const getNextJobNo = async () => {
    const counterRef = doc(db, "counters", "jobs");
    try {
      return await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        // ถ้ายังไม่มี Counter ให้เริ่มที่ 1
        let newCount = counterDoc.exists() ? counterDoc.data().current + 1 : 1;
        transaction.set(counterRef, { current: newCount });
        
        // คำนวณปี พ.ศ. (ค.ศ. + 543)
        const year = (new Date().getFullYear() + 543).toString().slice(-2);
        return String(newCount).padStart(3, "0") + "/" + year;
      });
    } catch (err) {
      console.error("Counter error:", err);
      return "ERROR";
    }
  };

  const handleSubmit = async () => {
    if (!title) return alert("กรุณากรอกรายละเอียดอาการ");
    if (!location) return alert("กรุณากดดึงพิกัดก่อนบันทึก");
    
    setLoading(true);
    try {
      const jobNo = await getNextJobNo();
      
      await addDoc(collection(db, "jobs"), {
        title: title.trim(),
        status: "รอซ่อม",
        jobNo: jobNo,
        createdAt: serverTimestamp(),
        location: location, // { lat: ..., lng: ... }
      });

      alert("บันทึกข้อมูลสำเร็จ! เลขงานของคุณคือ: " + jobNo);
      setTitle("");
      setLocation(null);
    } catch (e) {
      console.error("Submit error:", e);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#0056b3", textAlign: "center" }}>➕ แจ้งซ่อมท่อแตก/ท่อรั่ว</h2>
      <p style={{ textAlign: "center", color: "#666" }}>กปภ. สาขาท่าเรือ (035-341-814)</p>
      <hr />
      
      <div style={{ marginTop: "20px" }}>
        <label style={{ fontWeight: "bold" }}>รายละเอียดอาการ / สถานที่ใกล้เคียง:</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น พบท่อเมนแตกหน้าบ้านเลขที่... มีน้ำไหลนอง"
          rows="3"
          style={{ width: "100%", padding: "12px", marginTop: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) return alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด");
            
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              },
              (err) => {
                alert("ไม่สามารถดึงพิกัดได้ กรุณาเปิด GPS และอนุญาตให้เข้าถึงตำแหน่ง");
              },
              { enableHighAccuracy: true } // ดึงพิกัดแบบแม่นยำสูง
            );
          }}
          style={{ 
            width: "100%",
            padding: "12px", 
            cursor: "pointer", 
            backgroundColor: "#3498db", 
            color: "white", 
            border: "none", 
            borderRadius: "8px",
            fontSize: "15px"
          }}
        >
          📍 {location ? "อัปเดตพิกัดปัจจุบัน" : "กดเพื่อดึงพิกัด GPS"}
        </button>
        
        {location && (
          <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
            <span style={{ color: "#2e7d32", fontSize: "14px" }}>
              ✅ ได้พิกัดแล้ว: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        style={{ 
          marginTop: "30px", 
          width: "100%", 
          padding: "15px", 
          backgroundColor: loading ? "#ccc" : "#2ecc71",
