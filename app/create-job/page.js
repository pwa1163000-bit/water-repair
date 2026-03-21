"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  doc,
  runTransaction,
} from "firebase/firestore";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState(null);

  // 🔥 ฟังก์ชันสร้างเลขงาน
  const getNextJobNo = async () => {
    const counterRef = doc(db, "counters", "jobs");

    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        throw "Counter not found!";
      }

      let newCount = counterDoc.data().current + 1;

      transaction.update(counterRef, { current: newCount });

      // format 001/69
      const year = "69";
      const jobNo = String(newCount).padStart(3, "0") + "/" + year;

      return jobNo;
    });
  };

  const handleSubmit = async () => {
    if (!title) return alert("กรอกข้อมูลก่อน");

    try {
      const jobNo = await getNextJobNo();

await addDoc(collection(db, "jobs"), {
  title: title,
  status: "รอซ่อม",
  jobNo: jobNo,
  createdAt: new Date(),
  location: location, // 👈 เพิ่มบรรทัดนี้
});

      setTitle("");
      alert("บันทึกสำเร็จ: " + jobNo);
    } catch (error) {
      console.error(error);
      alert("error");
    }
  };

  return (
  <div style={{ padding: 20 }}>
    <h1>➕ แจ้งงานซ่อม</h1>

    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="เช่น ท่อแตก"
    />

    {/* 📍 ปุ่ม GPS */}
    <button
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            alert("ได้พิกัดแล้ว");
          },
          () => alert("เปิด GPS ก่อน")
        );
      }}
      style={{ display: "block", marginTop: 10 }}
    >
      📍 ดึงพิกัด
    </button>

    {/* 💾 ปุ่มบันทึก */}
    <button onClick={handleSubmit} style={{ marginTop: 10 }}>
      บันทึก
    </button>
  </div>
);
}
