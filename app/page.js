"use client";

import { useEffect, useState } from "react";
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

  // 🧮 ฟังก์ชันคำนวณสถิติ
  const total = jobs.length;
  const pending = jobs.filter(j => j.status?.trim() === "รอซ่อม" || j.status?.trim() === "ท่อแตก").length;
  const working = jobs.filter(j => j.status?.trim() === "กำลังซ่อม").length;
  const done = jobs.filter(j => j.status?.trim() === "เสร็จแล้ว" || j.status?.trim() === "ซ่อมแล้ว").length;

  // 📅 คำนวณงานวันนี้ (เปรียบเทียบแบบช่วงเวลา)
  const todayJobs = jobs.filter(j => {
    if (!j.createdAt) return false;
    
    // แปลงค่าจาก Firebase ให้เป็น Date Object
    const jobDate = j.createdAt.toDate ? j.createdAt.toDate() : new Date(j.createdAt.seconds * 1000 || j.createdAt);
    
    const now = new Date();
    return (
      jobDate.getDate() === now.getDate() &&
      jobDate.getMonth() === now.getMonth() &&
      jobDate.getFullYear() === now.getFullYear()
    );
  }).length;

  if (loading) return <div style={{ padding: 50, textAlign: "center", fontFamily: "sans-serif" }}>⏳ กำลังอัปเดตข้อมูล...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#1e293b", margin: 0, fontSize: "24px" }}>📊 แดชบอร์ดสรุปงานซ่อม</h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>การประปาส่วนภูมิภาค สาขาท่าเรือ</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
        <StatBox title="งานทั้งหมด" value={total} color="#475569" />
        <StatBox title="รอซ่อม/ท่อแตก" value={pending} color="#ef4444" />
        <StatBox title="กำลังดำเนินการ" value={working} color="#f59e0b" />
        <StatBox title="ซ่อมเสร็จสิ้น" value={done} color="#10b981" />
        <StatBox title="แจ้งวันนี้" value={todayJobs} color="#3b82f6" highlight={true} />
      </div>
      
      <p style={{ marginTop: "20px", textAlign: "right", fontSize: "12px", color: "#94a3b8" }}>
        อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.
      </p>
    </div>
  );
}

function StatBox({ title, value, color, highlight }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}, #1d4ed8)` : color,
      color: "white",
      padding: "25px 15px",
      borderRadius: "18px",
      textAlign: "center",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
    }}>
      <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "10px" }}>{title}</div>
      <div style={{ fontSize: "42px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
