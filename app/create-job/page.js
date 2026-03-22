"use client";

import { useState } from "react";
import { db } from "../../lib/firebase"; 
import { collection, addDoc, doc, runTransaction, serverTimestamp } from "firebase/firestore";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔑 นำรหัสจากหน้า https://api.imgbb.com/ มาวางตรงนี้ครับ
  const IMGBB_API_KEY = "วาง_API_KEY_ของคุณตรงนี้"; 

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
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("image", image); // ใช้ 'image' ตามคู่มือ ImgBB

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST", // ต้องใช้ POST เสมอ
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          imageUrl = result.data.url; 
        }
      }

      const jobNo = await getNextJobNo();
      await addDoc(collection(db, "jobs"), {
        title: title.trim(),
        status: "รอซ่อม",
        jobNo,
        imageUrl, 
        createdAt: serverTimestamp(),
        location,
      });

      alert("บันทึกสำเร็จ! เลขงาน: " + jobNo);
      setTitle(""); setLocation(null); setImage(null);
    } catch (e) {
      alert("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>➕ แจ้งซ่อม (กปภ. ท่าเรือ)</h2>
      <hr />
      <div style={{ marginTop: "20px" }}>
        <label>รายละเอียดอาการ:</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ระบุอาการท่อแตก/รั่ว..."
          style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>📸 ถ่ายรูปหน้างาน:</label>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setImage(e.target.files[0])} style={{ display: "block", marginTop: "10px" }} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => alert("กรุณาเปิด GPS"),
              { enableHighAccuracy: true }
            );
          }}
          style={{ padding: "10px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          📍 {location ? "ได้พิกัดแล้ว ✅" : "คลิกเพื่อดึงพิกัดปัจจุบัน"}
        </button>
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        style={{ marginTop: "30px", width: "100%", padding: "15px", backgroundColor: loading ? "#ccc" : "#2ecc71", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold" }}
      >
        {loading ? "กำลังบันทึก..." : "💾 บันทึกแจ้งซ่อม"}
      </button>
    </div>
  );
} // ปิดฟังก์ชัน CreateJob ให้ครบถ้วน
