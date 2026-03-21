"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  runTransaction
} from "firebase/firestore";

export default function CreateJob() {
  const [title, setTitle] = useState("");

  // 🔥 สร้างเลขงานอัตโนมัติ
  const getNextJobNo = async () => {
    const counterRef = doc(db, "counters", "jobs");

    const jobNo = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let current = 0;

      if (!counterDoc.exists()) {
        current = 1;
        transaction.set(counterRef, { current });
      } else {
        current = counterDoc.data().current + 1;
        transaction.update(counterRef, { current });
      }

      const year = new Date().getFullYear().toString().slice(-2);

      return `${String(current).padStart(3, "0")}/${year}`;
    });

    return jobNo;
  };

  // 🔥 บันทึกงาน
  const handleSubmit = async () => {
    try {
      const jobNo = await getNextJobNo();

      await addDoc(collection(db, "jobs"), {
        jobNo,
        title,
        status: "รอซ่อม",
        createdAt: new Date()
      });

      alert("บันทึกสำเร็จ: " + jobNo);
      setTitle("");

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div>
      <h1>แจ้งงาน</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="รายละเอียดงาน"
      />

      <button onClick={handleSubmit}>บันทึก</button>
    </div>
  );
}
