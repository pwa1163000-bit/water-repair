"use client";

import { useEffect, useState } from "react";
// ✅ ใช้การเรียกแบบระบุตำแหน่งที่ชัดเจน
import { db } from "./lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const total = jobs.length;
  const pending = jobs.filter(j => ["รอซ่อม", "ท่อแตก", "ท่อรั่ว"].includes(j.status?.trim())).length;
  const working = jobs.filter(j => j.status?.trim() === "กำลังซ่อม").length;
  const done = jobs.filter(j => ["เสร็จแล้ว", "ซ่อมแล้ว"].includes(j.status?.trim())).length;

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>⌛ กำลังอัปเดตข้อมูล...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#1e293b", margin: 0, fontSize: "24px" }}>📊 แดชบอร์ด กปภ. สาขาท่าเรือ</h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px" }}>
        <StatBox title="ทั้งหมด" value={total} color="#475569" />
        <StatBox title="รอซ่อม" value={pending} color="#ef4444" />
        <StatBox title="กำลังซ่อม" value={working} color="#f59e0b" />
        <StatBox title="เสร็จแล้ว" value={done} color="#10b981" />
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <a href="/create" style={{ padding: "15px", backgroundColor: "#3b82f6", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: "bold" }}>➕ แจ้งซ่อมใหม่</a>
        <a href="/jobs" style={{ padding: "15px", backgroundColor: "#1e293b", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: "bold" }}>📝 รายการงาน</a>
      </div>
    </div>
  );
}

// ✅ แก้ไข Syntax Error ตรงส่วน border ที่ค้างอยู่
function StatBox({ title, value, color, highlight }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}, #1d4ed8)` : "white",
      color: highlight ? "white" : "#1e293b",
      padding: "25px 15px",
      borderRadius: "20px",
      textAlign: "center",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
      border: highlight ? "none" : "1px solid #e2e8f0" // ปิด string ให้ถูกต้องแล้ว
    }}>
      <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "10px" }}>{title}</div>
      <div style={{ fontSize: "36px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
