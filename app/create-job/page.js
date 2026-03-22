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
      alert("บันทึกสำเร็จ: " + jobNo);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>➕ แจ้งงานซ่อม</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="เช่น ท่อแตก"
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => alert("กรุณาเปิด GPS")
          );
        }}
      >
        📍 ดึงพิกัด
      </button>

      {location && <p>📍 พิกัด: {location.lat}, {location.lng}</p>}

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        style={{ marginTop: 10, display: "block", width: "100%", padding: 10 }}
      >
        {loading ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </div>
  ); // ปิด Return
} // 👈 ปิด Export Function
