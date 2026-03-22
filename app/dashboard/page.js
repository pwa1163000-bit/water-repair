"use client";

import { useEffect, useState } from "react";
// ✅ แก้ไข Path: เนื่องจากไฟล์นี้อยู่ใน app/dashboard/ จึงต้องถอยออก 1 ชั้น (..) 
// เพื่อไปหาโฟลเดอร์ lib ที่อยู่ภายใต้ app/
import { db } from "../lib/firebase"; 
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

  // 🧮 คำนวณสถิติ
  const total = jobs.length;
  const pending = jobs.filter(j => ["รอซ่อม", "ท่อแตก", "ท่อรั่ว"].includes(j.status?.trim())).length;
  const working = jobs.filter(j => j.status?.trim() === "กำลังซ่อม").length;
  const done = jobs.filter(j => ["เสร็จแล้ว", "ซ่อมแล้ว"].includes(j.status?.trim())).length;

  if (loading) return <div style={{ padding: 50, textAlign: "center", fontFamily: "sans-serif", color: "#64748b" }}>⏳ กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ color: "#1e293b", margin: 0, fontSize: "26px", fontWeight: "800" }}>📊 ระบบสรุปงาน กปภ. ท่าเรือ</h1>
        <p style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "bold" }}>สาขาท่าเรือ (035-341-814)</p>
      </header>

      {/* สถิติหลัก */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <StatBox title="งานทั้งหมด" value={total} color="#475569" icon="📋" />
        <StatBox title="รอซ่อม" value={pending} color="#ef4444" icon="📍" />
        <StatBox title="กำลังซ่อม" value={working} color="#f59e0b" icon="🔧" />
        <StatBox title="เสร็จแล้ว" value={done} color="#10b981" icon="✅" />
      </div>

      {/* ปุ่มเมนูทางลัด */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", maxWidth: "500px", margin: "0 auto" }}>
        <a href="/create" style={navButtonStyle("#3b82f6")}>➕ แจ้งซ่อมใหม่</a>
        <a href="/jobs" style={navButtonStyle("#1e293b")}>📝 รายการงาน</a>
      </div>

      <footer style={{ marginTop: "40px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
        อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.
      </footer>
    </div>
  );
}

// Component สำหรับกล่องสถิติ
function StatBox({ title, value, color, icon }) {
  return (
    <div style={{
      backgroundColor: "white",
      padding: "20px 10px",
      borderRadius: "20px",
      textAlign: "center",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      borderTop: `5px solid ${color}`
    }}>
      <div style={{ fontSize: "20px", marginBottom: "5px" }}>{icon}</div>
      <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>{title}</div>
      <div style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b" }}>{value}</div>
    </div>
  );
}

const navButtonStyle = (bgColor) => ({
  display: "block",
  padding: "16px",
  backgroundColor: bgColor,
  color: "white",
  textAlign: "center",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "bold",
  fontSize: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
});
