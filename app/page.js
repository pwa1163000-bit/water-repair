"use client";

import { useEffect, useState } from "react";
import { db } from "./lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link"; // เพิ่ม Link สำหรับนำทาง

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
  const pending = jobs.filter(j => ["รอซ่อม", "ท่อแตก", "ท่อรั่ว"].includes(j.status?.trim())).length;
  const working = jobs.filter(j => j.status?.trim() === "กำลังซ่อม").length;
  const done = jobs.filter(j => ["เสร็จแล้ว", "ซ่อมแล้ว"].includes(j.status?.trim())).length;

  // 📅 คำนวณงานวันนี้
  const todayJobs = jobs.filter(j => {
    if (!j.createdAt) return false;
    const jobDate = j.createdAt.toDate ? j.createdAt.toDate() : new Date(j.createdAt.seconds * 1000 || j.createdAt);
    const now = new Date();
    return jobDate.toDateString() === now.toDateString();
  }).length;

  if (loading) return <div style={{ padding: 50, textAlign: "center", fontFamily: "sans-serif", color: "#64748b" }}>⏳ กำลังเชื่อมต่อข้อมูลฐานข้อมูล...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* ส่วนหัว */}
      <header style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ color: "#1e293b", margin: 0, fontSize: "26px", fontWeight: "800" }}>📊 Dashboard</h1>
          <p style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "bold", margin: 0 }}>กปภ. สาขาท่าเรือ</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.</p>
        </div>
      </header>

      {/* กล่องสถิติ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <StatBox title="งานทั้งหมด" value={total} color="#475569" icon="📋" />
        <StatBox title="รอซ่อม" value={pending} color="#ef4444" icon="📍" />
        <StatBox title="กำลังซ่อม" value={working} color="#f59e0b" icon="🔧" />
        <StatBox title="เสร็จแล้ว" value={done} color="#10b981" icon="✅" />
        <StatBox title="แจ้งวันนี้" value={todayJobs} color="#3b82f6" highlight={true} icon="🆕" />
      </div>

      {/* ส่วนเมนูทางลัด (Shortcuts) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
        <Link href="/create" style={navButtonStyle("#3b82f6")}>➕ แจ้งซ่อมใหม่</Link>
        <Link href="/jobs" style={navButtonStyle("#1e293b")}>📝 จัดการงานซ่อม</Link>
      </div>

      {/* กราฟแท่งแสดงสัดส่วนงาน (CSS Basic Bar) */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#1e293b" }}>📈 สัดส่วนสถานะงาน</h3>
        <div style={{ display: "flex", height: "30px", borderRadius: "15px", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
          <div style={{ width: `${(pending/total)*100}%`, backgroundColor: "#ef4444", transition: "0.5s" }}></div>
          <div style={{ width: `${(working/total)*100}%`, backgroundColor: "#f59e0b", transition: "0.5s" }}></div>
          <div style={{ width: `${(done/total)*100}%`, backgroundColor: "#10b981", transition: "0.5s" }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "12px", color: "#64748b" }}>
          <span>🔴 รอซ่อม {Math.round((pending/total)*100) || 0}%</span>
          <span>🟠 กำลังซ่อม {Math.round((working/total)*100) || 0}%</span>
          <span>🟢 เสร็จสิ้น {Math.round((done/total)*100) || 0}%</span>
        </div>
      </div>

    </div>
  );
}

function StatBox({ title, value, color, highlight, icon }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}, #2563eb)` : "white",
      color: highlight ? "white" : "#1e293b",
      padding: "20px 15px",
      borderRadius: "20px",
      textAlign: "center",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
      border: highlight ? "none" : "1px solid #e2e8f
