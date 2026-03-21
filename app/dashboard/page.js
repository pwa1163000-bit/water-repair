"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setJobs(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 คำนวณ
  const total = jobs.length;
  const pending = jobs.filter(j => j.status === "รอซ่อม").length;
  const working = jobs.filter(j => j.status === "กำลังซ่อม").length;
  const done = jobs.filter(j => j.status === "เสร็จแล้ว").length;

  // 📅 งานวันนี้
  const today = new Date().toDateString();
  const todayJobs = jobs.filter(j => {
    if (!j.createdAt) return false;
    const date = new Date(j.createdAt.seconds * 1000);
    return date.toDateString() === today;
  }).length;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

        <Box title="งานทั้งหมด" value={total} color="#333" />
        <Box title="รอซ่อม" value={pending} color="red" />
        <Box title="กำลังซ่อม" value={working} color="orange" />
        <Box title="เสร็จแล้ว" value={done} color="green" />
        <Box title="งานวันนี้" value={todayJobs} color="blue" />

      </div>
    </div>
  );
}

// 🔥 กล่องแสดงผล
function Box({ title, value, color }) {
  return (
    <div
      style={{
        background: color,
        color: "white",
        padding: 20,
        borderRadius: 10,
        minWidth: 120,
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}
