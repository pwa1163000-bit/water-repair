"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
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
    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let newCount = counterDoc.exists() ? counterDoc.data().current + 1 : 1;
      transaction.set(counterRef, { current: newCount });
      const year = (new Date().getFullYear() + 543).toString().slice(-2);
      return String(newCount).padStart(3, "0") + "/" + year;
    });
  };

  const handleSubmit = async () => {
    if (!title || !location) return alert("กรุณากรอกข้อมูลและดึงพิกัดก่อน");
    setLoading(true);
    try {
      const jobNo = await getNextJobNo();
      await addDoc(collection(db, "jobs"), {
        title,
        status: "รอซ่อม",
        jobNo,
        createdAt: serverTimestamp(),
        location,
      });
      setTitle("");
      setLocation(null);
      alert("บันทึกสำเร็จ เลขงาน: " + jobNo);
    } catch (e) {
      alert("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>➕ แจ้งงานซ่อม (กปภ.)</h1>
      <hr />
      
      <div style={{ marginTop: "20px" }}>
        <label>รายละเอียดอาการ:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ท่อแตก, น้ำไม่ไหล"
          style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => alert("กรุณาเปิด GPS บนมือถือ")
            );
          }}
          style={{ padding: "10px", cursor: "pointer", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "8px" }}
        >
          📍 คลิกเพื่อดึงพิกัดปัจจุบัน
        </button>
        {location && <p style={{ marginTop: "10px", color: "green" }}>✅ ได้พิกัดแล้ว: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        style={{ 
          marginTop: "30px", 
          width: "100%", 
          padding: "15px", 
          backgroundColor: loading ? "#ccc" : "#2ecc71", 
          color: "white", 
          border: "none", 
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "กำลังบันทึกข้อมูล..." : "💾 บันทึกแจ้งซ่อม"}
      </button>
    </div>
  );
}
